North
====================
**Align and Guide Your Project**

North is a set of standards and best practices for developing modern web based properties. Included are standards and best practices for all aspects of a project, from kick off through development. North encourages an agile, content-first, approach to product development and a mobile-first, in-browser, system based approach to design and development.

North is meant to be a living document. Standards and best practices change, and as they do and have been vetted, North will grow and change with them. North will be versioned using [SEMVER](http://semver.org/) to provide a way for you to specify what version of North you are using for your project.

*This project is currently a work in progress*

1. Development Process
2. Content Strategy
3. Visual Design
5. [Building Websites](#building-websites)
  * [Components](#components)
  * [Layouts](#layouts)
  * [Aspects](#aspects)
  * [Elements](#elements)
  * [CSS Naming Conventions](#css-naming-conventions)
  * [Sass and Compass](#sass-and-compass)
    * [Partial Structure](#partial-structure)
    * [Mixin/Extend Pattern](#mixinextend-pattern)
   
6. JavaScript
7. Progressive Enhancement

# Performance

When building modern websites, performance is a real design and development constraint and must be taken into account at every level of the development process. The reason it is a design and development constraint is fairly simple: with the explosion of an everything-conencted world and the rise of the mobile-only user, the chances that a site is going to be viewed primarily by someone sitting at a workstation with a high speed internet connection diminishes daily. This constraint isn't new either; way back in 2006, Amazon reported that a [100ms delay cost them 1% of sales](https://sites.google.com/site/glinden/Home/StanfordDataMining.2006-11-28.ppt?attredirects=0). This was before the great reach of broadband took hold and before the current mobile computing boom came full swing, which have only lessened the patience of consumers. As [Compuware Reports](http://e-commercefacts.com/research/2011/07/what-usrs-want-from-mobil/19986_WhatMobileUsersWant_Wp.pdf), *75% of mobile web users expect a site to load as fast or faster* on their mobile devices as they do their desktop computers, with *60% of mobile web users leaving a site and not coming back if it takes more than 3 seconds to load, with 78% of users trying only one more time*. Moreover, if a user abandons your mobile site, *33% will go to a competitor's site*. What all this means is that **performance affects website revenue**. Google, helpfully, provides some interesting insight into how performance could have affected their 2011 revenue:

* Google made approximately [$18.8 Million](http://blog.hubspot.com/blog/tabid/6307/bid/33784/An-Industry-Breakdown-of-Google-s-100-Million-Per-Day-Advertising-Revenue-INFOGRAPHIC.aspx) per day on search advertising.
* A 400ms delay (less than half of a second) [reduces average number of daily searches by 0.59%](http://www.igvita.com/slides/2013/breaking-1s-mobile-barrier.pdf)
* That amounts to a **daily loss of $111,000**, or about **$40.5 Million a year**

When discussing and testing performance, it is important to do both with an eye toward mobile. This means that all performance testing needs to take place on actual devices, not just emulations, and on actual networks. Many of the standards have some wiggle room, but presented are the ideals and maximums for performance standards. The ideals and maximums have been chosen with an eye towards the realities of a media heavy site, including the realities of advertising and heavy multimedia usage. As [80% of the end-user response time is spend on the front-end](http://developer.yahoo.com/blogs/ydn/high-performance-sites-rule-1-fewer-http-requests-7163.html), most of the performance suggestions are front-end based.

### Load

Load times and load sizes are extraordinary important and often overlooked. Ideal statistics are presented first, with maximums presented second that should only be broached under edge circumstances.

* *Time To First Byte:* **200ms** - 350ms
* *DOM Content Loaded:* **1000ms** - 2000ms
* *JS Load Event Fired:* **900ms** - 2200ms
* *Total Download Size:* **1MB** - 2MB
* *DNS Lookup:* **10ms** - 20ms
* *HTTP Requests:* **50** - 75



# Building Websites

While in the past it may have been good enough to see a high-res Desktop sized Photoshop comp to build a website, the vast and varying landscape of the modern web makes 

## Components

Components are the primary building block of any interface. They are the bits and bobs that combine to form a cohesive user interface; from menus to messages, pagers to pictures, and everything else in between. Components should be written to be able to be dropped in to any position in a layout. The way to accomplish this is to build components using [**eq.js**](https://github.com/snugug/eq.js). This will allow a component and its elements to respond appropriately regardless of where they land in a given document flow. Components should simple layouts to position elements inside of themselves either through extends or by constructing a component with elements placed inside an internal layout (decide before starting a project and carry that decision through the lifespan of the project) if the layout is not component specific. They may choose to control their overall sizing and one-off sizing and positioning, but those choices should be relative the container they are dropped in to and not layout or position specific.

### Base Component

Each project should contain a `base` component which contains base styling for raw tags (`h2`, `blockquote`, `p`, etc…). The `base` component's elements should be named after the tag they style, so basic styling for `h2` would provide both an extendable and full class `.base--h2`. To apply these styles, create a `styled` aspect, providing a `.base--STYLED` class. This aspect should have raw elements styled without classes, allowing it to be dropped into any section of a site and provide basic styling. Additional aspects can be created to create different base stylings.

## Layouts

Layouts are the structure of an interface. Providing structure to pages and components, layouts are responsible for sizing and positioning of their elements. There are two kinds of layouts, simple and complex. The distinguishing factor between simple and complex layouts is that complex layouts adapt and change their sizing and positioning based on media queries whereas simple layouts do not. Complex layouts are generally used for laying out pages and regions within pages, with simple layouts being used for laying out sub-sections inside complex layouts and providing common layouts for components. While simple layouts may be used within components or even within other simple or complex layouts, complex layouts should never be used within one another.

## Aspects

Aspects are a specific implementation of a component or layout. Components and layouts always should have an aspect when used to determine what kind implementation is being worked with. Aspects can be used as a way to pivot styling of elements if need be or to control implementation-specific styling, such as changing colors in a message component or determining exact sizing of a body element of a layout. It is preferable to use aspects as pivot points than to create unique classes for each element as it allows for the reuse of identical elements regardless of the aspect of a component or layout they are used in.

## Elements

Elements are the individual pieces that make up a component or layout, each being component or layout specific. Think of them as individual elements (`h2`, `blockquote`, `p`, etc…) in components and regions and items in layouts. When styling an item inside components or layouts, it is strongly discouraged to use raw tag selectors and instead use element classes for each. This is to avoid any potential conflicts, such as would happen if you have a pager component inside of a slider component (`.slider li` and `.pager li`). The only exception to this rule is for the [base component](#base-component).

## States

States provide a way to alter how a component, layout, element, or aspect behaves. Common states include `active`, `open`, and `closed`. Because states live in the in-between world of JavaScript and CSS, often changing with interactions from the user, states are controlled by data attributes and get attached to the components, layouts, elements, or aspects they are modifying. This provides easy to maintain states on a per-object basis without needing per-object states.

## CSS Naming Conventions

Components and layouts form prefixes the prefixes for aspects and elements, separated by double dash (`--`). Simple layouts start with an underscore (`_`) and complex layouts start with two underscores (`__`) to distinguish them from components, and aspects are written in all caps (`CAPS`) to distinguish them from elements, written in all lowercase (`lowercase`). States are applied to the state data attribute (`data-state`) and queried using attribute selectors as they have the strong tendency to either be manipulated by JavaScript or be used as a hook for JavaScript. A sample document written up using this naming convention could look like the following:

```html
<!-- Article layout with Big Media aspect -->
<div class="__article--BIG-MEDIA">
  <!-- Main element of Article layout -->
  <article class="__article--main">
    <!-- Heading element of Article layout -->
    <div class="__article--heading">
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
    <div class="__article--body typography--AREA">
      <h2>Some user entered copy goes here</h2>
      <p>Yay Copy!</p>
    </div>
  </article>
  <!-- Secondary element of Article layout  -->
  <aside class="__article--secondary">
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

## Sass and Compass

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

### Partial Structure

Sass partials are a way for us to organize our styling knowledge into maintainable and easily grokable chunks. An example Sass partial structure is available in the folder `sass`.

At the root of our Sass folder is our `style.scss` file, which holds the core of our styling, and a `no-script.scss` file to provide a CSS fallback if scripting isn't available. In the `sass` folder, create an `enhancements` folder a `fallbacks` folder, and a `partials` folder for your stylesheets that provide enhanced styling for powerful browsers, fallback styling less powerful browsers, and partials for all to draw from, each respectively.

Each feature you're enhancing with or providing a fallback for should be named `feature.scss` and be placed into their respective folder; for instance if you were to provide enhancements and fallback for CSS Animations, you would have a folder structure that looked something like `sass/enhancements/css-animations.scss` and `sass/fallbacks/css-animations.scss`.

The `partials` directory should be divided up into 3 sub directories, `global`, `components`, and `layouts`. Inside of `global`, you should have a  folder a piece for `variables`, `functions`, `mixins`, and `extendables`, with partials to match. Inside each of those folders should go partials whose content should be made available globally and aren't component specific. For instance, global color and typographic variables, background/text color contrast mixins, ligature extendables, etc… 

Both your components and your layouts should be built using a similar partial structure, henceforth known as the component partial structure. Each component should have a partial and matching folder, and inside that folder a partial a piece for `variables`, `functions`, `mixins`, and `extendables`. Each of these partials should hold styling knowledge specific to that component; for instance, `variables` could have color variables specific to that component, but the color it is set to should come from the global color partial. An example of this can be seen in in the example `sass` folder.

All extendable classes should be wrapped in a solution to only have the selector written once to ensure that selectors don't get needlessly duplicated. Mixins should share their naming convention with the object they are used to style. The solution provided by the North Compass extension is derived from Wilson Page's [Sass Import Once](https://github.com/wilsonpage/sass-import-once) partial.
