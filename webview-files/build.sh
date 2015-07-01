#!/bin/sh

HEAD=`cat head.html`
TAIL=`cat tail.html`
OUTFILE="cubetest.html"

echo $HEAD > $OUTFILE

for FILEPATH in `cat files.txt`; do

    echo "<!-- $FILEPATH -->" >> $OUTFILE
    echo "<script>\n " >> $OUTFILE
    cat $FILEPATH >> $OUTFILE
    echo "\n\n</script>" >> $OUTFILE
    
done

echo $TAIL >> $OUTFILE
