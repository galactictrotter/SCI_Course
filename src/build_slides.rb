#!/usr/bin/env ruby

require "cgi"
require "digest"
require "erb"
require "fileutils"
require "json"
require "yaml"

ROOT = File.expand_path("..", __dir__)
FONT_FILES = %w[
  barlow-condensed-400.ttf
  barlow-condensed-600.ttf
  eb-garamond-600.ttf
  eb-garamond-700.ttf
  lora-400.ttf
  lora-600.ttf
].freeze

def abort_with(message)
  warn "ERROR: #{message}"
  exit 1
end

def present_string?(value)
  value.is_a?(String) && !value.strip.empty?
end

def validate_content!(content)
  abort_with("content root must be a mapping") unless content.is_a?(Hash)
  abort_with("schema_version must be 1") unless content["schema_version"] == 1

  lesson = content["lesson"]
  abort_with("lesson must be a mapping") unless lesson.is_a?(Hash)
  abort_with("lesson.number must be a positive integer") unless lesson["number"].is_a?(Integer) && lesson["number"].positive?
  %w[course title language].each do |field|
    abort_with("lesson.#{field} is required") unless present_string?(lesson[field])
  end
  abort_with("lesson.language must be fr") unless lesson["language"] == "fr"

  %w[points_principaux resume_long place_de_la_lecon].each do |section|
    items = content[section]
    abort_with("#{section} must be a non-empty array") unless items.is_a?(Array) && !items.empty?
    abort_with("#{section} contains an empty item") unless items.all? { |item| present_string?(item) }
  end

  questions = content["questions"]
  abort_with("questions must be a non-empty array") unless questions.is_a?(Array) && !questions.empty?
  questions.each_with_index do |item, index|
    abort_with("questions[#{index}] must be a mapping") unless item.is_a?(Hash)
    abort_with("questions[#{index}].question is required") unless present_string?(item["question"])
    abort_with("questions[#{index}].answer is required") unless present_string?(item["answer"])
  end
end

def split_text(text, max_chars)
  remaining = text.strip
  chunks = []

  while remaining.length > max_chars
    window = remaining[0, max_chars]
    sentence_cut = nil
    window.to_enum(:scan, /[.!?][»”"']?(?:\s+|\z)/).each do
      sentence_cut = Regexp.last_match.end(0)
    end
    whitespace_cut = window.rindex(/\s/)
    cut = if sentence_cut && sentence_cut >= (max_chars * 0.55)
      sentence_cut
    else
      whitespace_cut
    end
    abort_with("unable to split an overlong content item") unless cut && cut.positive?

    chunks << remaining[0, cut].strip
    remaining = remaining[cut..].strip
  end
  chunks << remaining unless remaining.empty?
  chunks
end

def paginate(items, max_items:, max_chars:)
  indexed = items.each_with_index.flat_map do |text, index|
    split_text(text, max_chars).each_with_index.map do |segment, segment_index|
      {
        "number" => index + 1,
        "text" => segment,
        "continuation" => segment_index.positive?
      }
    end
  end
  pages = []
  current = []
  current_chars = 0

  indexed.each do |item|
    item_chars = item.fetch("text").length
    abort_with("item #{item.fetch("number")} exceeds the #{max_chars}-character slide limit after splitting") if item_chars > max_chars
    must_break = !current.empty? && (current.length >= max_items || current_chars + item_chars > max_chars)
    if must_break
      pages << current
      current = []
      current_chars = 0
    end
    current << item
    current_chars += item_chars
  end
  pages << current unless current.empty?
  pages
end

def rich_text(text)
  lines = text.lines.map(&:strip).reject(&:empty?)
  bullet_index = lines.index { |line| line.start_with?("- ") }
  return "<p>#{CGI.escapeHTML(text.strip)}</p>" unless bullet_index

  intro = lines[0...bullet_index].join(" ")
  bullets = lines[bullet_index..].map { |line| line.sub(/\A-\s*/, "") }
  html = +""
  html << "<p>#{CGI.escapeHTML(intro)}</p>" unless intro.empty?
  html << "<ul>"
  bullets.each { |bullet| html << "<li>#{CGI.escapeHTML(bullet)}</li>" }
  html << "</ul>"
  html
end

def numbered_items_html(items)
  items.map do |item|
    number_label = if item.fetch("continuation", false)
      "#{item.fetch("number")}.<span class=\"continuation-label\">suite</span>"
    else
      "#{item.fetch("number")}."
    end
    <<~HTML
      <div class="numbered-item">
        <div class="item-number">#{number_label}</div>
        <div class="item-body">#{rich_text(item.fetch("text"))}</div>
      </div>
    HTML
  end.join
end

def section_header(name, index, final, final_marker)
  suffix = final ? " #{final_marker}" : ""
  "#{name} · #{index}#{suffix}"
end

lesson_path = ARGV.fetch(0, nil)
abort_with("usage: npm run lesson -- Lesson-N") unless lesson_path

lesson_dir = File.expand_path(lesson_path, ROOT)
abort_with("lesson directory is outside the package root") unless lesson_dir.start_with?(ROOT + File::SEPARATOR)
content_path = File.join(lesson_dir, "content.yaml")
abort_with("missing #{content_path}") unless File.file?(content_path)

content_source = File.read(content_path, encoding: "UTF-8")
content = YAML.safe_load(content_source, permitted_classes: [], aliases: false)
validate_content!(content)

tokens = JSON.parse(File.read(File.join(ROOT, "config", "design-tokens.json"), encoding: "UTF-8"))
lesson = content.fetch("lesson")
lesson_title_class = lesson.fetch("title").length > 54 ? " lesson-title--long" : ""
final_marker = tokens.fetch("pagination").fetch("final_marker")
content_pagination = tokens.fetch("pagination").fetch("content_sections")
content_max_items = content_pagination.fetch("max_items")
content_max_characters = content_pagination.fetch("max_characters")
course_footer = "Cours de SIC - Leçon #{lesson.fetch("number")}"

slides = []
slides << {
  "role" => "cover",
  "title" => lesson.fetch("title"),
  "section" => nil,
  "section_index" => nil,
  "final" => false,
  "content" => nil
}

point_pages = paginate(content.fetch("points_principaux"), max_items: content_max_items, max_chars: content_max_characters)
point_pages.each_with_index do |items, index|
  slides << {
    "role" => "points",
    "title" => section_header("Points principaux", index + 1, index == point_pages.length - 1, final_marker),
    "section" => "points_principaux",
    "section_index" => index + 1,
    "final" => index == point_pages.length - 1,
    "content" => numbered_items_html(items),
    "item_count" => items.length,
    "character_count" => items.sum { |item| item.fetch("text").length },
    "compact" => items.sum { |item| item.fetch("text").length } > 520
  }
end

resume_pages = paginate(content.fetch("resume_long"), max_items: content_max_items, max_chars: content_max_characters)
resume_pages.each_with_index do |items, index|
  slides << {
    "role" => "resume",
    "title" => section_header("Résumé long", index + 1, index == resume_pages.length - 1, final_marker),
    "section" => "resume_long",
    "section_index" => index + 1,
    "final" => index == resume_pages.length - 1,
    "content" => numbered_items_html(items),
    "item_count" => items.length,
    "character_count" => items.sum { |item| item.fetch("text").length },
    "compact" => true
  }
end

questions = content.fetch("questions")
questions.each_with_index do |item, index|
  slides << {
    "role" => "question",
    "title" => section_header("Questions", index + 1, index == questions.length - 1, final_marker),
    "section" => "questions",
    "section_index" => index + 1,
    "final" => index == questions.length - 1,
    "question" => item.fetch("question")
  }
end

questions.each_with_index do |item, index|
  slides << {
    "role" => "discussion_question",
    "title" => "Discussion · #{index + 1}",
    "section" => "discussion",
    "section_index" => index + 1,
    "final" => false,
    "question" => item.fetch("question")
  }
  slides << {
    "role" => "discussion_answer",
    "title" => section_header("Discussion · réponse", index + 1, index == questions.length - 1, final_marker),
    "section" => "discussion",
    "section_index" => index + 1,
    "final" => index == questions.length - 1,
    "question" => item.fetch("question"),
    "answer" => item.fetch("answer")
  }
end

place_pages = paginate(content.fetch("place_de_la_lecon"), max_items: content_max_items, max_chars: content_max_characters)
place_pages.each_with_index do |items, index|
  slides << {
    "role" => "place",
    "title" => section_header("Place de la leçon", index + 1, index == place_pages.length - 1, final_marker),
    "section" => "place_de_la_lecon",
    "section_index" => index + 1,
    "final" => index == place_pages.length - 1,
    "content" => numbered_items_html(items),
    "item_count" => items.length,
    "character_count" => items.sum { |item| item.fetch("text").length },
    "compact" => true
  }
end

total = slides.length
slides_html = slides.each_with_index.map do |slide, index|
  current = index + 1
  slide_id = format("slide-%03d", current)
  global_pagination = tokens.fetch("pagination").fetch("global_format")
    .gsub("%{current}", current.to_s)
    .gsub("%{total}", total.to_s)

  body = if slide.fetch("role") == "cover"
    <<~HTML
      <div class="cover-rule" aria-hidden="true"></div>
      <h1 class="cover-title">#{CGI.escapeHTML(lesson.fetch("title"))}</h1>
    HTML
  elsif %w[question discussion_question discussion_answer].include?(slide.fetch("role"))
    answer_html = if slide["answer"]
      <<~HTML
        <div class="answer">
          <span class="answer-label">Réponse</span>
          #{rich_text(slide.fetch("answer"))}
        </div>
      HTML
    else
      ""
    end
    <<~HTML
      <header class="slide-header">#{CGI.escapeHTML(slide.fetch("title"))}</header>
      <h1 class="lesson-title#{lesson_title_class}" data-overflow-check>#{CGI.escapeHTML(lesson.fetch("title"))}</h1>
      <section class="slide-content" data-overflow-check>
        <div class="question-layout">
          <div class="question-number">#{slide.fetch("section_index")}.</div>
          <p class="question-text">#{CGI.escapeHTML(slide.fetch("question"))}</p>
        </div>
        #{answer_html}
      </section>
    HTML
  else
    compact_class = slide["compact"] ? " compact" : ""
    <<~HTML
      <header class="slide-header">#{CGI.escapeHTML(slide.fetch("title"))}</header>
      <h1 class="lesson-title#{lesson_title_class}" data-overflow-check>#{CGI.escapeHTML(lesson.fetch("title"))}</h1>
      <section class="slide-content#{compact_class}" data-overflow-check>
        #{slide.fetch("content")}
      </section>
    HTML
  end

  <<~HTML
    <article class="slide#{current == 1 ? " is-active" : ""}" id="#{slide_id}" data-slide-id="#{slide_id}" data-slide-title="#{CGI.escapeHTML(slide.fetch("title"))}" aria-hidden="#{current == 1 ? "false" : "true"}">
      #{body}
      <footer class="slide-footer">
        <span class="course-footer">#{CGI.escapeHTML(course_footer)}</span>
        <span class="global-pagination">#{global_pagination}</span>
      </footer>
    </article>
  HTML
end.join

colors = tokens.fetch("colors")
layout = tokens.fetch("layout")
type = tokens.fetch("type")
canvas_width = tokens.fetch("canvas").fetch("width")
canvas_height = tokens.fetch("canvas").fetch("height")
css_template = ERB.new(File.read(File.join(ROOT, "templates", "slides.css.erb"), encoding: "UTF-8"), trim_mode: "-")
css = css_template.result(binding)
javascript = File.read(File.join(ROOT, "templates", "slides.js"), encoding: "UTF-8")
content_sha = Digest::SHA256.hexdigest(content_source)
h = ->(value) { CGI.escapeHTML(value.to_s) }
html_template = ERB.new(File.read(File.join(ROOT, "templates", "slides.html.erb"), encoding: "UTF-8"), trim_mode: "-")
html = html_template.result(binding)

output_dir = File.join(lesson_dir, "slides")
font_output_dir = File.join(output_dir, "assets", "fonts")
FileUtils.mkdir_p(font_output_dir)
FONT_FILES.each do |font|
  source = File.join(ROOT, "assets", "fonts", font)
  abort_with("missing bundled font #{source}") unless File.file?(source)
  FileUtils.cp(source, File.join(font_output_dir, font))
end

File.write(File.join(output_dir, "index.html"), html, mode: "w", encoding: "UTF-8")

section_counts = slides.reject { |slide| slide.fetch("role") == "cover" }.group_by { |slide| slide.fetch("section") }.transform_values(&:length)
manifest = {
  "schema_version" => 1,
  "lesson" => lesson,
  "aspect_ratio" => tokens.fetch("canvas").fetch("ratio"),
  "content_sha256" => content_sha,
  "pagination_policy" => tokens.fetch("pagination"),
  "slide_count" => total,
  "section_slide_counts" => section_counts,
  "slides" => slides.each_with_index.map do |slide, index|
    {
      "number" => index + 1,
      "id" => format("slide-%03d", index + 1),
      "role" => slide.fetch("role"),
      "section" => slide.fetch("section"),
      "section_index" => slide.fetch("section_index"),
      "final" => slide.fetch("final"),
      "title" => slide.fetch("title"),
      "item_count" => slide["item_count"],
      "character_count" => slide["character_count"]
    }
  end
}
File.write(File.join(output_dir, "manifest.json"), JSON.pretty_generate(manifest) + "\n", mode: "w", encoding: "UTF-8")

puts "Built #{total} slides: #{File.join(output_dir, "index.html")}"
