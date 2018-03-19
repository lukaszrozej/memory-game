var gulp = require('gulp');
var svgmin = require('gulp-svgmin');
var svgstore = require('gulp-svgstore');
var fs = require('fs');

gulp.task('default', function() {

  const d = fs.readdirSync('src/decks')
    .map(function(deck) {
      return {
        name: deck,
        cards: fs.readdirSync(`src/decks/${deck}`)
          .map(card => card.replace('.svg', ''))
      }
    });
  const text = 'const decks =\n' + JSON.stringify(d, null, 2);
  fs.writeFileSync('js/decks.js', text);

  return gulp
    .src('src/**/*.svg')
    .pipe(svgmin())
    .pipe(svgstore())
    .pipe(gulp.dest('svg'));
});

// gulp.task('js', function(done) {
//   const d = fs.readdirSync('sprites/decks')
//     .map(function(deck) {
//       return {
//         name: deck,
//         cards: fs.readdirSync(`sprites/decks/${deck}`)
//           .map(card => card.replace('.svg', ''))
//       }
//     });
//   const text = 'const decks =\n' + JSON.stringify(d, null, 2);
//   fs.writeFileSync('js/decks.js', text);
//   done();
// });

// gulp.task('default', function(taskDone) {
//   runSequence(
//     'svgs',
//     'js', 
//     taskDone
//   );
// });