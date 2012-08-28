#!/bin/sh

rm -f $1-big-*.png
convert -density 200 -quality 100 -resize x600 $1.pdf $1-big.png
rm -f $1-small-*.png
convert -resize x100 $1.pdf $1-small.png

