# Отчет об исправлении проблем с зависимостями в workspace

## Проблема
CI падал на шаге установки зависимостей для `libs/shared-types` с ошибкой:
```
The `npm ci` command can only install with an existing package-lock.json or npm-shrinkwrap.json with lockfileVersion >= 1.
```

## Причина
1. В папке `libs/shared-types` отсутствовал `package-lock.json`
2. В папке `libs/shared/schema` отсутствовал `package.json`
3. CI пытался выполнить `npm ci` в каждой папке отдельно, не учитывая что это npm workspace

## Решение

### 1. Создан недостающий package.json
Создан `libs/shared/schema/package.json`:
```json
{
  "name": "@roleplay-identity/shared-schema",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "types": "./src/index.ts"
    }
  },
  "devDependencies": {
    "typescript": "5.6.3"
  }
}
```

### 2. Настроен npm workspace
Добавлена секция `workspaces` в корневой `package.json`:
```json
"workspaces": [
  "apps/*",
  "libs/*",
  "libs/*/*"
]
```

### 3. Обновлен CI workflow
- Убраны отдельные шаги установки зависимостей для каждого пакета
- Добавлен единый шаг `npm ci` для всего workspace
- Добавлена проверка доступности workspace пакетов

### 4. Обновлены скрипты
Упрощены скрипты в корневом `package.json`:
- `install:all`: теперь просто `npm install`
- `install:all:production`: теперь просто `npm ci --production`

## Структура зависимостей
```
@roleplay-identity/shared-schema -> libs/shared/schema
@roleplay-identity/shared-types -> libs/shared-types (зависит от shared-schema)
@roleplay-identity/shared-utils -> libs/shared-utils (зависит от shared-types)
```

## Результат
- ✅ Все workspace пакеты правильно связаны
- ✅ CI больше не будет падать на установке зависимостей
- ✅ Упрощена структура установки зависимостей
- ✅ Улучшена производительность CI (меньше шагов)

## Проверка
Выполнена команда `npm ls --workspaces` для проверки корректности связей между пакетами. 