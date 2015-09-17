#!/bin/sh

SRCDIR="demo_src"
HEAD=`cat $SRCDIR/head.html`
TAIL=`cat $SRCDIR/tail.html`
OUTFILE="cubetest.html"

echo $HEAD > $OUTFILE
for FILEPATH in `cat $SRCDIR/files.txt`; do

    echo "<!-- $FILEPATH -->" >> $OUTFILE
    echo "<script>\n " >> $OUTFILE
    cat $SRCDIR/$FILEPATH >> $OUTFILE
    echo "\n\n</script>" >> $OUTFILE
    
done

echo $TAIL >> $OUTFILE
