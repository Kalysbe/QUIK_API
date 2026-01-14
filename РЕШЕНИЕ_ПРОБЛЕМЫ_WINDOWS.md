# Решение проблемы "Init system not found" на Windows

## Проблема

При выполнении `pm2 startup` на Windows возникает ошибка:
```
[PM2][ERROR] Init system not found
Error: Init system not found
```

## Причина

Команда `pm2 startup` предназначена для Linux/Unix систем и не работает на Windows напрямую.

## ✅ Решение

### Быстрое решение (РЕКОМЕНДУЕТСЯ)

Используйте `pm2-windows-startup`:

```powershell
# 1. Установите pm2-windows-startup
npm install -g pm2-windows-startup

# 2. Убедитесь, что PM2 запущен и сохранен
npm run pm2:start
pm2 save

# 3. Установите автозапуск
pm2-windows-startup install
```

### Проверка

```powershell
# Проверьте статус PM2
pm2 status

# Проверьте задачу в планировщике
Get-ScheduledTask | Where-Object {$_.TaskName -like "*PM2*"}
```

### Что дальше?

1. **Приложение уже работает** - PM2 запущен и приложение работает
2. **После перезагрузки** - PM2 автоматически запустится благодаря pm2-windows-startup
3. **Управление** - используйте обычные команды PM2:
   ```powershell
   pm2 status
   pm2 logs quikmodule
   pm2 restart quikmodule
   ```

## Альтернативные решения

### Вариант 1: NSSM (для полноценной Windows Service)

```powershell
.\scripts\install-service-nssm.ps1
```

### Вариант 2: Планировщик задач Windows

Создайте задачу вручную через GUI или используйте PowerShell (см. `WINDOWS_SERVICE_SETUP.md`)

## Дополнительная информация

- Подробная инструкция: `WINDOWS_SERVICE_SETUP.md`
- Основная инструкция: `ИНСТРУКЦИЯ_ПО_ЗАПУСКУ.md`

## Важно

✅ **Приложение уже работает** - ошибка при установке автозапуска не означает, что приложение не запущено!

Проверьте:
```powershell
pm2 status
```

Если приложение показывает статус `online`, значит всё работает правильно. Проблема только в настройке автозапуска, которую мы решили через `pm2-windows-startup`.

