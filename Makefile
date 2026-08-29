LESSON ?= Lesson-5

.PHONY: production build validate

production: build validate

build:
	ruby src/build_slides.rb $(LESSON)

validate:
	ruby src/validate_slides.rb $(LESSON)
