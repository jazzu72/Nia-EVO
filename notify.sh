#!/data/data/com.termux/files/usr/bin/bash

MESSAGE="$1"
DIR="$(cd "$(dirname "$0")" && pwd)"

"$DIR/send_sms.sh" "+17573399245" "$MESSAGE"
