#!/usr/bin/env ruby

require "cgi"
require "digest"
require_relative "content"
require_relative "build_signature"
require "json"
require "yaml"

ROOT = File.expand_path("..", __dir__)

def fail_validation(message)
  warn "VALIDATION ERROR: #{message}"
  exit 1
end

lesson_path = ARGV.fetch(0, nil)
fail_validation("usage: npm run validate -- Lesson-N") unless lesson_path

lesson_dir = File.expand_path(lesson_path, ROOT)
fail_validation("lesson directory is outside the package root") unless lesson_dir.start_with?(ROOT + File::SEPARATOR)
content_path = File.join(lesson_dir, "content.yaml")
html_path = File.join(lesson_dir, "slides", "index.html")
manifest_path = File.join(lesson_dir, "slides", "manifest.json")

[content_path, html_path, manifest_path].each do |path|
  fail_validation("missing #{path}") unless File.file?(path)
end

begin
  content_source, content = load_content(content_path)
  html = File.read(html_path, encoding: "UTF-8")
  manifest = JSON.parse(File.read(manifest_path, encoding: "UTF-8"))
  tokens = JSON.parse(File.read(File.join(ROOT, "config", "design-tokens.json"), encoding: "UTF-8"))

  fail_validation("generated layout is stale; rebuild the lesson") unless manifest.fetch("build_sha256") == build_signature(ROOT)

  expected_sha = Digest::SHA256.hexdigest(content_source)
  fail_validation("generated deck is stale") unless manifest.fetch("content_sha256") == expected_sha
  fail_validation("HTML content hash is stale") unless html.include?(%Q(content-sha256" content="#{expected_sha}"))
  fail_validation("aspect ratio must be 16:10") unless manifest.fetch("aspect_ratio") == "16:10"
  fail_validation("pagination policy mismatch") unless manifest.fetch("pagination_policy") == tokens.fetch("pagination")

  fail_validation("lesson metadata mismatch") unless manifest.fetch("lesson") == content.fetch("lesson")
  FONT_FILES.each do |font|
    bundled = File.join(lesson_dir, "slides", "assets", "fonts", font)
    source = File.join(ROOT, "assets", "fonts", font)
    fail_validation("missing or damaged bundled font: #{font}") unless File.file?(bundled) && Digest::SHA256.file(bundled) == Digest::SHA256.file(source)
  end

  slides = manifest.fetch("slides")
  fail_validation("missing cover slide") unless slides.first&.fetch("role") == "cover"
  expected_roles = ["cover"] + %w[points resume question discussion_question discussion_answer place]
  fail_validation("unknown slide role") unless slides.all? { |slide| expected_roles.include?(slide.fetch("role")) }
  html_ids = html.scan(/<article\b[^>]*?\sid="([^"]+)"/).flatten
  fail_validation("HTML slide IDs or order mismatch") unless html_ids == slides.map { |slide| slide.fetch("id") }
  html_titles = html.scan(/data-slide-title="([^"]*)"/).flatten.map { |title| CGI.unescapeHTML(title) }
  fail_validation("HTML slide titles mismatch") unless html_titles == slides.map { |slide| slide.fetch("title") }
  section_counts = slides.drop(1).group_by { |slide| slide.fetch("section") }.transform_values(&:length)
  fail_validation("section slide counts mismatch") unless section_counts == manifest.fetch("section_slide_counts")
  section_roles = { "points_principaux" => ["points"], "resume_long" => ["resume"], "questions" => ["question"], "discussion" => %w[discussion_question discussion_answer], "place_de_la_lecon" => ["place"] }
  expected_sequence = ["cover"]
  section_roles.each do |section, roles|
    section_slides = slides.select { |slide| slide.fetch("section") == section }
    fail_validation("missing section: #{section}") if section_slides.empty?
    section_slides.each_with_index do |slide, index|
      fail_validation("incorrect section index: #{slide.fetch("id")}") unless slide.fetch("section_index") == index / roles.length + 1
      fail_validation("incorrect final marker: #{slide.fetch("id")}") unless slide.fetch("final") == (index == section_slides.length - 1)
      expected_sequence << roles[index % roles.length]
    end
  end
  fail_validation("slide sequence mismatch") unless slides.map { |slide| slide.fetch("role") } == expected_sequence
  fail_validation("slide count mismatch") unless slides.length == manifest.fetch("slide_count")
  fail_validation("slide IDs are not unique") unless slides.map { |slide| slide.fetch("id") }.uniq.length == slides.length
  fail_validation("slide numbers are not sequential") unless slides.map { |slide| slide.fetch("number") } == (1..slides.length).to_a

  expected_final_sections = %w[points_principaux resume_long questions discussion place_de_la_lecon]
  actual_final_sections = slides.select { |slide| slide.fetch("final") }.map { |slide| slide.fetch("section") }
  fail_validation("incorrect final-section markers: #{actual_final_sections.inspect}") unless actual_final_sections == expected_final_sections
  final_headers = html.scan(/<header class="slide-header">[^<]*et fin<\/header>/)
  fail_validation("expected five et fin section headers") unless final_headers.length == 5

  pagination = html.scan(/<span class="global-pagination">(\d+) of (\d+)<\/span>/).map { |current, total| [current.to_i, total.to_i] }
  fail_validation("global pagination count mismatch") unless pagination.length == slides.length
  fail_validation("global pagination is not sequential") unless pagination == (1..slides.length).map { |number| [number, slides.length] }

  expected_navigation = navigation_html(ROOT, content.fetch("lesson"), slides).strip
  actual_navigation = html[/<nav class="deck-navigation".*?<\/nav>/m]
  fail_validation("footer navigation mismatch; rebuild the lesson") unless actual_navigation == expected_navigation

  questions = content.fetch("questions")
  question_roles = slides.count { |slide| slide.fetch("role") == "question" }
  discussion_question_roles = slides.count { |slide| slide.fetch("role") == "discussion_question" }
  discussion_answer_roles = slides.count { |slide| slide.fetch("role") == "discussion_answer" }
  fail_validation("question-only slide count mismatch") unless question_roles == questions.length
  fail_validation("discussion question slide count mismatch") unless discussion_question_roles == questions.length
  fail_validation("discussion answer slide count mismatch") unless discussion_answer_roles == questions.length

  content_policy = tokens.fetch("pagination").fetch("content_sections")
  content_sections = %w[points_principaux resume_long place_de_la_lecon]
  slides.select { |slide| content_sections.include?(slide.fetch("section")) }.each do |slide|
    fit = slide.fetch("measurement")
    size = fit.fetch("font_size")
    fail_validation("invalid reading size: #{slide.fetch("id")}") unless size.between?(content_policy.fetch("min_single_point_font_size"), content_policy.fetch("font_size"))
    fail_validation("multiple points must use the standard reading size") if slide.fetch("item_count") > 1 && size != content_policy.fetch("font_size")
    fail_validation("measured overflow: #{slide.fetch("id")}") if fit.fetch("measured_height") > fit.fetch("available_height")
    fail_validation("reading area mismatch") unless fit.fetch("available_height") == tokens.fetch("layout").fetch("reading_height") - content_policy.fetch("bottom_safety_px")
    fail_validation("measured item count mismatch") unless fit.fetch("end") - fit.fetch("start") + 1 == slide.fetch("item_count")
  end

  # Every source point must appear exactly once, in order, as a whole item.
  articles = html.scan(/<article\b[^>]*id="(slide-\d+)"[^>]*>(.*?)<\/article>/m).to_h
  content_sections.each do |section|
    rendered_numbers = slides.select { |slide| slide.fetch("section") == section }.flat_map do |slide|
      articles.fetch(slide.fetch("id")).scan(/<div class="item-number">(\d+)\.<\/div>/).flatten.map(&:to_i)
    end
    fail_validation("split, missing or reordered source points in #{section}") unless rendered_numbers == (1..content.fetch(section).length).to_a
  end
  fail_validation("source points must not have continuation fragments") if html.include?('<span class="continuation-label">')

  fail_validation("unresolved ERB token") if html.include?("<%") || html.include?("%>")
  fail_validation("unexpected source-code marker") if html.match?(/\\n\\n\d+/)

  puts "Validated #{slides.length} slides"
  puts "Sections: #{manifest.fetch("section_slide_counts")}"
  puts "Question-only: #{question_roles}; discussion pairs: #{discussion_answer_roles}"
rescue JSON::ParserError, KeyError, TypeError, NoMethodError, ArgumentError => error
  fail_validation("invalid content or generated artifacts (#{error.message}); rebuild the lesson")
end
