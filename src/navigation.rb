require "json"
require "yaml"
require "cgi"

# Titles and actual folder names come from the lesson sources, not padded guesses.
def lesson_catalog(root)
  available = Dir.glob(File.join(root, "Lesson-*", "content.yaml")).map do |path|
    lesson = YAML.safe_load(File.read(path), permitted_classes: [], aliases: false).fetch("lesson")
    [lesson.fetch("number"), { "number" => lesson.fetch("number"), "title" => lesson.fetch("title"), "folder" => File.basename(File.dirname(path)) }]
  end.to_h
  early_titles = JSON.parse(File.read(File.join(root, "config", "incomplete-lessons.json")))
  (1..33).map do |number|
    available[number] || { "number" => number, "title" => early_titles[number.to_s], "folder" => nil }
  end
end

def navigation_html(root, lesson, slides)
  escape = ->(value) { CGI.escapeHTML(value.to_s) }
  icon = ->(name) { File.read(File.join(root, "#{name}.svg")).sub("<svg ", '<svg aria-hidden="true" focusable="false" ') }
  labels = { nil => "Titre de la leçon", "points_principaux" => "Points principaux", "resume_long" => "Résumé long", "questions" => "Questions", "discussion" => "Discussion", "place_de_la_lecon" => "Place de la leçon" }
  seen = []
  options = slides.each_with_index.filter_map do |slide, index|
    section = slide.fetch("section")
    next if seen.include?(section)
    seen << section
    %(<option value="#{index + 1}">#{escape.call(labels.fetch(section))}</option>)
  end.join("\n")
  entries = lesson_catalog(root).map do |entry|
    number = format("%02d", entry.fetch("number"))
    title = entry["title"] || "Titre à confirmer"
    text = %(<span class="lesson-menu-number">#{number}</span><span>#{escape.call(title)}</span>)
    if entry["folder"]
      current = entry["number"] == lesson.fetch("number") ? ' aria-current="page"' : ''
      %(<li><a href="../../#{escape.call(entry.fetch("folder"))}/slides/index.html#/1"#{current}>#{text}</a></li>)
    else
      %(<li><span class="lesson-unavailable" aria-disabled="true">#{text}<small>Indisponible</small></span></li>)
    end
  end.join("\n")
  <<~HTML
    <nav class="deck-navigation" aria-label="Navigation du cours">
      <button type="button" id="lesson-menu-toggle" class="nav-icon" aria-label="Choisir une leçon" title="Choisir une leçon" aria-expanded="false" aria-controls="lesson-menu">#{icon.call("menu")}</button>
      <div id="lesson-menu" class="lesson-menu" hidden>
        <h2>Les leçons · 01–33</h2>
        <ul aria-label="Leçons 01 à 33">#{entries}</ul>
      </div>
      <span class="nav-divider" aria-hidden="true"></span>
      <button type="button" id="first-slide" class="nav-icon" aria-label="Première diapositive" title="Première diapositive">#{icon.call("arrow-left-to-line")}</button>
      <button type="button" id="previous-slide" class="nav-icon" aria-label="Diapositive précédente" title="Diapositive précédente">#{icon.call("arrow-left")}</button>
      <select id="section-select" aria-label="Aller à une section">#{options}</select>
      <button type="button" id="next-slide" class="nav-icon" aria-label="Diapositive suivante" title="Diapositive suivante">#{icon.call("arrow-right")}</button>
      <button type="button" id="last-slide" class="nav-icon" aria-label="Dernière diapositive" title="Dernière diapositive">#{icon.call("arrow-right-to-line")}</button>
    </nav>
  HTML
end
