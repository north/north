North
====================
**Align and Guide Your Project**

North is a set of standards and best practices for developing modern web based properties. Included are standards and best practices for all aspects of a project, from kick off through development. North encourages an agile, content-first, approach to product development and a mobile-first, in-browser, system based approach to design and development.

North is meant to be a living document. Standards and best practices change, and as they do and have been vetted, North will grow and change with them. North will be versioned using [SEMVER](http://semver.org/) to provide a way for you to specify what version of North you are using for your project.

*This project is currently a work in progress*

1. Development Process
2. Content Strategy
3. Visual Design
5. HTML
6. CSS
 * Selector Naming Conventions
 * Sass
 * Sass Structure
7. JavaScript
8. Progressive Enhancement


# Building Websites

While in the past it may have been good enough to see a high-res Desktop sized Photoshop comp to build a website, the vast and varying landscape of the modern web makes 

## Components

Components are the primary building block of any interface. They are the bits and bobs that you combine to form a cohesive user interface; from menus to messages, pagers to pictures. Blocks, 

## Layouts

## Aspects

## Elements

## States

## CSS

### Naming Conventions and Build Philosophy

Components and layouts form prefixes the prefixes for aspects and elements, separated by double dash (`--`). Layouts start with an underscore (`_`) to distinguish them from components, and aspects are written in all caps (`CAPS`) to distinguish them from elements, written in all lowercase (`lowercase`). States are applied to the state data attribute (`data-state`) and queried using attribute selectors as they have the strong tendency to either be manipulated by JavaScript or be used as a hook for JavaScript. A sample document written up using this naming convention could look like the following:

```html
<!-- Article layout with Big Media aspect -->
<div class="_article--BIG-MEDIA">
  <!-- Main element of Article layout -->
  <article class="_article--main">
    <!-- Heading element of Article layout -->
    <div class="_article--heading">
      <!-- PRIMARY Heading aspect of Typography component -->
      <h1 class="typography--PRIMARY-HEADING">Article Title</h1>
    </div>
    <!-- Media element of Article layout -->
    <figure class="_article--media">
      <!-- Video components, Full HD aspect -->
      <div class="video--FULL-HD">
        <!-- Video element of Video component -->
        <video class="video--video" />
      </div>
    </figure>
    <!-- Body element of Article layout, Area aspect of Typography component  -->
    <div class="_article--body typography--AREA">
      <h2>Some user entered copy goes here</h2>
      <p>Yay Copy!</p>
    </div>
  </article>
  <!-- Secondary element of Article layout  -->
  <aside class="_article--secondary">
    <!-- Popular aspect of Related component -->
    <div class="related--POPULAR">
      <!-- Heading element of Related component -->
      <div class="related--heading">
        <!-- Tertiary Heading aspect of Typography component -->
	     <h2 class="typography--TERTIARY-HEADING">Block Title</h2>
	   </div>
	   <!-- Body element of Related component -->
	   <div class="related--body">
	     <p>Yay Copy!</p>
	   </div>
	 </div>
  <aside>
</div>
```

### Sass+Compass

When writing CSS, use [Sass](http://sass-lang.com/) with the [Compass](http://compass-style.org/) authoring framework. When compiling Sass and Compass, only use the Ruby gems to compile them or a tool that calls out to the Ruby gems. The `scss` syntax should be used exclusively when writing and sharing Sass. In order to ensure that all environments are the same, the minimum version of Ruby that should be used is `2.0.0` (standard on OS X version 10.9 and up) and all gems should be installed and versions managed by [Bundler](http://bundler.io/). When writing a [Gemfile](http://bundler.io/v1.5/gemfile.html), versions should all be specified using the `~>` specifier to ensure that gems stay on the same major and minor versions, making upgrades in minor versions purposeful. Gems should be installed in to a `vendor` folder in each project, which should be ignored from version control. In addition to Bundler, there are a number of Compass extensions that should be used as a standard for a variety of needs.

* [Singularity](https://github.com/Team-Sass/Singularity) - Grid framework
* [Breakpoint](https://github.com/Team-Sass/breakpoint) - Media query framework
* [Toolkit](https://github.com/team-sass/toolkit) - Variety of useful tools for web design and development
* [Jacket](https://github.com/Team-Sass/jacket) - Tool for deciding what gets printed in a given stylesheet
* [Color Schemer](https://github.com/Team-Sass/color-schemer) - Advanced color functions
* [Modular Scale](https://github.com/Team-Sass/modular-scale) - Numeric relationships, especially for typography

The following should be using the standard [Compass configuration](http://compass-style.org/help/tutorials/configuration-reference/) for all projects:

```ruby
# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "css"
sass_dir = "sass"
images_dir = "images"
javascripts_dir = "js"
fonts_dir = "fonts"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
line_comments = false
```


### Mixin/Extend Pattern

Mixins are best used when they don't needlessly duplicate the properties they write. We can do this using placeholder selectors and `@extend`. The only properties that should be erectly written to the selector calling a mixin should be properties that have been directly altered due to mixin arguments. Any other properties should be extended. All arguments that have default values should have those default values controlled by globally namespaced `!default` variables to make overriding those defaults easy and accessible. All mixins that provide extends should also have an `$extend` optional argument, ideally as its last argument, also globally defaulted.

Mixins should also be divided up by purpose. While an omni mixin may be easier to write, having smaller mixins will make maintaining and using your mixins, as well as changing discrete parts of a rendered component, easier to do.

Let's take a look at a typical message component mixin as an example of how to re-write it using our mixin/extend pattern.

```scss
// Sass
@mixin message($color, $padding: .25em .5em, $width: 80%) {
  box-sizing: border-box;
  padding: $padding;

  width: $width;
  margin: 0 auto;

  border: 2px solid $color;
  background: mix(white, $color, 25%);
  color: mix(black, $color, 25%);
}

.message--STATUS {
    @include message(green);
}

.message--WARNING {
    @include message(yellow);
}

.message--ERROR {
    @include message(red);
}
```

```css
/* CSS */
.message--STATUS {
  box-sizing: border-box;
  padding: .25em .5em;
  width: 80%;
  margin: 0 auto;
  border: 2px solid green;
  background: #3f9f3f;
  color: #006000;
}

.message--WARNING {
  box-sizing: border-box;
  padding: .25em .5em;
  width: 80%;
  margin: 0 auto;
  border: 2px solid yellow;
  background: #ffff3f;
  color: #bfbf00;
}

.message--ERROR {
  box-sizing: border-box;
  padding: .25em .5em;
  width: 80%;
  margin: 0 auto;
  border: 2px solid red;
  background: #ff3f3f;
  color: #bf0000;
}
```

While the single mixin may allow us to easily get the output we want, it does so at the cost of duplicating properties, and thus vastly bloating, our output CSS. This can be remedied almost entirely simply by rewriting our original mixin using our new mixin/extend pattern.

```scss
// Sass
$message-padding: .25em .5em !default;
$message-width: 80% !default;
$message-extend: true !default;

@mixin message--CORE($padding: $message-padding, $width: $message-width, $extend: $message-extend) {
  // If we're not extending ($extend == false), we write properties directly
  @if not $extend {
    box-sizing: border-box;
    padding: $padding;
    
    width: $width;
    margin: 0 auto;
    
    // Border's color is based off of the `color` property, so we can write valid shorthand without the color. Border options aren't dynamic to clearly show a succinctly show this short hand method.
    border: 2px solid;
  }
  @else {
    // If we are extending ($extend == true), we extend the placeholder selector
    @extend %message--CORE;
    // If $padding is different than our default padding, we write that property
    @if $padding != $message-padding {
        padding: $padding;
    }
    // If $width is different than our default width, we write that property
    @if $width != $message-width {
      width: $width;
    }
  }
}

@mixin message-coloring($color) {
  border-color: $color;
  background: mix(white, $color, 25%);
  color: mix(black, $color, 25%);
}

%message--CORE {
  // We include the message-core mixin with $extend == false to force the properties to be written
  @include message--CORE($extend: false);
}

.message--STATUS {
  @include message--CORE;
  @include message-coloring(green);
}

.message--WARNING {
  @include message--CORE;
  @include message-coloring(yellow);
}

.message--ERROR {
  @include message--CORE;
  @include message-coloring(red);
}
```

```css
/* CSS */
.message--STATUS, .message--WARNING, .message--ERROR {
  box-sizing: border-box;
  padding: 0.25em 0.5em;
  width: 80%;
  margin: 0 auto;
  border: 2px solid;
}

.message--STATUS {
  border-color: green;
  background: #3f9f3f;
  color: #006000;
}

.message--WARNING {
  border-color: yellow;
  background: #ffff3f;
  color: #bfbf00;
}

.message--ERROR {
  border-color: red;
  background: #ff3f3f;
  color: #bf0000;
}
```

While this approach certainly requires more work up front to build the mixins and extendables, it produces much more controlled and succinct output CSS, which is what we're aiming to write. 

### Sass Structure

Sass partials are a way for us to organize our styling knowledge into maintainable and easily grokable chunks. An example Sass partial structure is available in the folder `sass`.

At the root of our Sass folder is our `style.scss` file, which holds the core of our styling, and a `no-script.scss` file to provide a CSS fallback if scripting isn't available. In the `sass` folder, create an `enhancements` folder a `fallbacks` folder, and a `partials` folder for your stylesheets that provide enhanced styling for powerful browsers, fallback styling less powerful browsers, and partials for all to draw from, each respectively.

Each feature you're enhancing with or providing a fallback for should be named `feature.scss` and be placed into their respective folder; for instance if you were to provide enhancements and fallback for CSS Animations, you would have a folder structure that looked something like `sass/enhancements/css-animations.scss` and `sass/fallbacks/css-animations.scss`.

The `partials` directory should be divided up into 3 sub directories, `global`, `components`, and `layouts`. Inside of `global`, you should have a  folder a piece for `variables`, `functions`, `mixins`, and `extendables`, with partials to match. Inside each of those folders should go partials whose content should be made available globally and aren't component specific. For instance, global color and typographic variables, background/text color contrast mixins, ligature extendables, etc… 

Both your components and your layouts should be built using a similar partial structure, henceforth known as the component partial structure. Each component should have a partial and matching folder, and inside that folder a partial a piece for `variables`, `functions`, `mixins`, and `extendables`. Each of these partials should hold styling knowledge specific to that component; for instance, `variables` could have color variables specific to that component, but the color it is set to should come from the global color partial. An example of this can be seen in in the example `sass` folder.

All extendable classes should be wrapped in a solution to only have the selector written once to ensure that selectors don't get needlessly duplicated. Mixins should share their naming convention with the object they are used to style. The solution provided by the North Compass extension is derived from Wilson Page's [Sass Import Once](https://github.com/wilsonpage/sass-import-once) partial.

### Component Styling

Components should be written to be able to be dropped in to any position in a layout. The way to accomplish this is to build components using [**eq.js**](https://github.com/snugug/eq.js).
