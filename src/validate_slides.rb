#!/usr/bin/env ruby

require "digest"
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
content_path = File.join(lesson_dir, "content.yaml")
html_path = File.join(lesson_dir, "slides", "index.html")
manifest_path = File.join(lesson_dir, "slides", "manifest.json")

[content_path, html_path, manifest_path].each do |path|
  fail_validation("missing #{path}") unless File.file?(path)
end

content_source = File.read(content_path, encoding: "UTF-8")
content = YAML.safe_load(content_source, permitted_classes: [], aliases: false)
html = File.read(html_path, encoding: "UTF-8")
manifest = JSON.parse(File.read(manifest_path, encoding: "UTF-8"))
tokens = JSON.parse(File.read(File.join(ROOT, "config", "design-tokens.json"), encoding: "UTF-8"))

expected_sha = Digest::SHA256.hexdigest(content_source)
fail_validation("generated deck is stale") unless manifest.fetch("content_sha256") == expected_sha
fail_validation("HTML content hash is stale") unless html.include?(%Q(content-sha256" content="#{expected_sha}"))
fail_validation("aspect ratio must be 16:10") unless manifest.fetch("aspect_ratio") == "16:10"
fail_validation("pagination policy mismatch") unless manifest.fetch("pagination_policy") == tokens.fetch("pagination")

slides = manifest.fetch("slides")
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

questions = content.fetch("questions")
question_roles = slides.count { |slide| slide.fetch("role") == "question" }
discussion_question_roles = slides.count { |slide| slide.fetch("role") == "discussion_question" }
discussion_answer_roles = slides.count { |slide| slide.fetch("role") == "discussion_answer" }
fail_validation("question-only slide count mismatch") unless question_roles == questions.length
fail_validation("discussion question slide count mismatch") unless discussion_question_roles == questions.length
fail_validation("discussion answer slide count mismatch") unless discussion_answer_roles == questions.length

content_policy = tokens.fetch("pagination").fetch("content_sections")
max_items = content_policy.fetch("max_items")
max_characters = content_policy.fetch("max_characters")
content_sections = %w[points_principaux resume_long place_de_la_lecon]
slides.select { |slide| content_sections.include?(slide.fetch("section")) }.each do |slide|
  fail_validation("#{slide.fetch("id")} exceeds #{max_items} items") if slide.fetch("item_count") > max_items
  fail_validation("#{slide.fetch("id")} exceeds #{max_characters} characters") if slide.fetch("character_count") > max_characters
end

fail_validation("unresolved ERB token") if html.include?("<%") || html.include?("%>")
fail_validation("unexpected source-code marker") if html.match?(/\\n\\n\d+/)

puts "Validated #{slides.length} slides"
puts "Sections: #{manifest.fetch("section_slide_counts")}"
puts "Question-only: #{question_roles}; discussion pairs: #{discussion_answer_roles}"
