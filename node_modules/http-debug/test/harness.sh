#!/bin/bash
test_st=0
for f in $(ls test/*.js); do
  echo $f
  tape $f
  test_st=`expr $? + $test_st`
done
exit $test_st
