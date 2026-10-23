# Вива Брок ЕООД — website concept

Separate public design demo using the existing six insurance pages. Forms only prepare a local preview and do not send inquiries.

Live preview: https://alexandermarkovdev.github.io/viva-brok-demo/

## Company information

Вива Брок ЕООД

бул. „Никола Вапцаров“ 9А, Пловдив

032 650 300

Source: https://maps.app.goo.gl/Mt8P1vu2JWAgFtGw9

Office photo supplied by the user.

## Local preview

Run `python -m http.server 8080 --directory dist`.

## Publish

Run `powershell -ExecutionPolicy Bypass -File scripts/publish.ps1`. Set `git config core.hooksPath .githooks` to publish future commits automatically.
