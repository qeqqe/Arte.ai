#!/bin/sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

until nc -z "$host" "$port"; do
  echo >&2 "Waiting for $host:$port..."
  sleep 1
done

echo >&2 "Connected to $host:$port!"
exec $cmd
