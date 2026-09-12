require "digest"
require_relative "navigation"

# Content hashes alone cannot detect stale layouts or changed font metrics.
def build_signature(root)
  paths = %w[src/build_slides.rb src/navigation.rb config/incomplete-lessons.json menu.svg arrow-left.svg arrow-right.svg arrow-left-to-line.svg arrow-right-to-line.svg src/content.rb src/pagination.rb src/measure_pagination.mjs config/design-tokens.json templates/slides.css.erb templates/slides.html.erb templates/slides.js] + Dir.glob("assets/fonts/*.ttf", base: root).sort
  Digest::SHA256.hexdigest(paths.map { |path| path + "\0" + File.binread(File.join(root, path)) }.join("\0") + JSON.generate(lesson_catalog(root)).b)
end
