# angular-rich-text-diff

Plunker: http://plnkr.co/edit/wmf4t70Di19Vtk89TWgK?p=preview

This is a directive that uses google-diff-match-patch to show the semantic diff between two HTML strings,
while preserving the HTML formatting. The point is to show the diff of two sets of "rich text" that has 
typically been entered by a user into a rich text input such as textAngular.

The idea for this approach came from a [stackoverflow answer](http://stackoverflow.com/questions/2132914/is-there-a-js-diff-library-against-htmlstring-just-like-google-diff-match-patch?rq=1).
I couldn't find an actual implementation anywhere, so I created one.

## Dependencies

### ngSanitize

You will need to include angular-sanitize.js in your project, as this directive
depends on ngSanitize in order to display the resulting HTML.

### google-diff-match-patch

This dependency is declared in the bower.json, but you will still need to be sure
to include the google-diff-match-patch.js file in your project.

## Usage

Install from bower:

```
bower install angular-rich-text-diff
```

Include angular-rich-text-diff.js and google-diff-match-patch.js in your index.html. Add the module to your app's dependencies:

```
angular.module('app', ['angular-rich-text-diff']);
```

Put the following HTML somewhere, where left and right are strings containing the before and after HTML
you want to diff:

```
<rich-text-diff left="beforeString" right="afterString"></rich-text-diff>
```

The CSS in angular-rich-text-diff.css will highlight additions in green and deletions in red.
