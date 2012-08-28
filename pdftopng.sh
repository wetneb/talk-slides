#!/bin/sh

convert -density 200 -quality 100 -resize x600 $1.pdf $1-big.png
convert -resize x200 $1.png $1-small.png

