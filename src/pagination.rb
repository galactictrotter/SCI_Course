require "open3"

# The browser measures the exact generated point markup with the final CSS and
# bundled fonts. Whole points are never approximated by character counts.
def measured_pagination(content, css, tokens)
  sections = %w[points_principaux resume_long place_de_la_lecon].to_h do |section|
    [section, content.fetch(section).each_with_index.map do |text, index|
      numbered_items_html([{ "number" => index + 1, "text" => text.strip }])
    end]
  end
  payload = {
    "css" => css,
    "font_dir" => File.join(ROOT, "assets", "fonts"),
    "viewport" => tokens.fetch("canvas").slice("width", "height"),
    "policy" => tokens.fetch("pagination").fetch("content_sections"),
    "sections" => sections
  }
  output, error, status = Open3.capture3("node", File.join(ROOT, "src", "measure_pagination.mjs"), stdin_data: JSON.generate(payload))
  abort_with(error.strip) unless status.success?
  JSON.parse(output)
rescue Errno::ENOENT
  abort_with("Node.js is required for rendered pagination")
end

def measured_items(content, section, page)
  (page.fetch("start")..page.fetch("end")).map do |index|
    { "number" => index + 1, "text" => content.fetch(section)[index].strip }
  end
end
