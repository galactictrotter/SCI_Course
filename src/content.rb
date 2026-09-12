require "yaml"

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

  reject_unknown_keys!(content, %w[schema_version lesson points_principaux resume_long questions place_de_la_lecon], "content")
  lesson = content["lesson"]
  abort_with("lesson must be a mapping") unless lesson.is_a?(Hash)
  reject_unknown_keys!(lesson, %w[number course title language], "lesson")
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
    reject_unknown_keys!(item, %w[question answer], "questions[#{index}]")
    abort_with("questions[#{index}].question is required") unless present_string?(item["question"])
    abort_with("questions[#{index}].answer is required") unless present_string?(item["answer"])
  end
end

def reject_unknown_keys!(mapping, allowed, location)
  unknown = mapping.keys - allowed
  abort_with("#{location} contains unknown fields: #{unknown.join(', ')}") unless unknown.empty?
end

def load_content(path)
  source = File.read(path, encoding: "UTF-8")
  content = YAML.safe_load(source, permitted_classes: [], aliases: false)
  validate_content!(content)
  [source, content]
rescue Psych::Exception => error
  abort_with("invalid YAML: #{error.message}")
end
