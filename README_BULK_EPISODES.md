# Массовое добавление серий

Добавлен admin endpoint:

```http
POST /api/admin/episodes/bulk
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json
```

Минимальный JSON:

```json
{
  "doramaId": 12,
  "startEpisodeNumber": 1,
  "overwriteExisting": false,
  "rawText": "<iframe src=\"https://vkvideo.ru/video_ext.php?oid=-1&id=1&hash=aaa&hd=4\"></iframe>\n<iframe src=\"https://vkvideo.ru/video_ext.php?oid=-1&id=2&hash=bbb&hd=4\"></iframe>"
}
```

Поддерживаемые форматы строк в `rawText`:

```text
https://vkvideo.ru/video_ext.php?...
<iframe src="https://vkvideo.ru/video_ext.php?..." ...></iframe>
3 | Серия 3 | https://vkvideo.ru/video_ext.php?...
4 | https://vkvideo.ru/video_ext.php?...
Спецвыпуск | https://vkvideo.ru/video_ext.php?...
```

Если `overwriteExisting = false`, существующие номера серий будут пропущены. Если `true`, серии с такими номерами будут обновлены.
