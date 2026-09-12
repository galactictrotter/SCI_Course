LESSON ?= Lesson-5

.PHONY: production build validate test

production: build
	ruby src/validate_slides.rb "$(LESSON)"

build:
	ruby src/build_slides.rb "$(LESSON)"

validate:
	ruby src/validate_slides.rb "$(LESSON)"

test:
	node --test tests/*.test.mjs
