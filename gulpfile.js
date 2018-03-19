var gulp = require('gulp');
var svgmin = require('gulp-svgmin');
var svgstore = require('gulp-svgstore');
var fs = require('fs');

gulp.task('default', function() {

  const d = fs.readdirSync('sprites/decks')
    .map(function(deck) {
      return {
        name: deck,
        cards: fs.readdirSync(`sprites/decks/${deck}`)
          .map(card => card.replace('.svg', ''))
      }
    });
  const text = 'const decks =\n' + JSON.stringify(d, null, 2);
  fs.writeFileSync('js/decks.js', text);

  return gulp
    .src('sprites/**/*.svg')
    .pipe(svgmin())
    .pipe(svgstore())
    .pipe(gulp.dest('svg'));
});
