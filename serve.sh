#!/bin/bash
cd /Users/junya/Documents/adams.j/todo-app
python3 -m http.server ${PORT:-3000}
