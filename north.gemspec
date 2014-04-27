require './lib/north'

Gem::Specification.new do |s|
  # Release Specific Information
  s.version = North::VERSION
  s.date = North::DATE

  # Gem Details
  s.name = "north"
  s.rubyforge_project = "north"
  s.description = %q{Really simple media queries in Sass}
  s.summary = %q{An easy to use system for writing and managing media queries.}
  s.authors = ["Sam Richard"]
  s.email = ["sam@snug.ug"]
  s.homepage = "https://github.com/snugug/north"
  s.licenses = ["MIT"]

  # Gem Files
  s.files = ["README.md"]
  s.files += ["CHANGELOG.md"]
  s.files += Dir.glob("lib/**/*.*")
  s.files += Dir.glob("north/**/*.*")

  # Gem Bookkeeping
  s.required_rubygems_version = ">= 1.3.6"
  s.rubygems_version = %q{1.3.6}

  s.add_dependency("sass",      ["~>3.3"])
end