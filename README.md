# Memory Game

A project for the Udacity Front-End Nanodegree course.

You can play it [here](https://lukaszrozej.github.io/memory-game/)

## How to play

Click on cards to flip them and find cards that match.
Flipping 2 cards counts as one move.
Your star rating is based on number of moves you need to match all cards.
You start with 3 stars and lose one when you make moves number 13, 17 and 21.

## Credit where credit is due

CSS animations were adapted from [Animate.css](https://daneden.github.io/animate.css/).

Card flipping transitions were adapted from [article by David Walsh](https://davidwalsh.name/css-flip).

All SVG icons I used were made by [Freepik](http://www.freepik.com) from [www.flaticon.com](https://www.flaticon.com/).
Licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/).

## How to add decks

First clone the repository and install dependencies by running:

```sh
npm install
```

Then copy a directory containing 8 svg files into sprites/decks/.
and run:

```sh
gulp
```
