# Файл локализации на русском языке для Telegram бота Invista

### Только для внутреннего использования

## Названия сцен

start-scene-name = Старт

income-scene-name = Создание прихода

outcome-scene-name = Создание расхода

report-scene-name = Отчёт

## Сцена старта

telegram-id = Ваш telegram_id: { $id }

welcome = Добро пожаловать в проект!

welcome-to-project = Вы в проекте "{ $name }"

input-action = Выберите действие ниже:

## Транзакции

crypto-transactions = <b>Крипто-транзакции:</b>{"\u000A"}

transaction-summary = <b>Создание {
    $type ->
    [in] прихода
    *[out] расхода
} :</b>{"\u000A"}{"\u000A"}——————————————{"\u000A"}Сумма: <b>{ $amountString } { $currency }</b>{"\u000A"}
                { $cryptoTransactionString }Комментарий: "{ $comment }"

success = Успешно!

# Сцена отчёта

input-period = Выберите период:

input-report-type = Выберите удобную форму представления.

input-report-type-with-filter = Активные фильтры:{"\u000A"}{"\u000A"}{ $type }{"\u000A"}{ $user }{"\u000A"}{"\u000A"}Выберите удобную форму представления.

input-beginning-date = Выберите дату начала:

input-end-date = Выберите дату окончания:

input-day = Выберите день:

input-types = Выберите тип:

input-users = Выберите пользователя:

period = {
    $isEqual ->
    [true] за {$startDateText}
    *[other] с {$startDateText} по {$endDateText}
}

report-project-name = {
    $type ->
    *[other] проект
} { $name }

report-name-pdf = Отчёт для { report-project-name } { period }.pdf

report-name-xlsx = Отчёт для { report-project-name } { period }.xlsx

id-header = Номер

name-header = Название

type-header = Тип

amount-header = Сумма

currency-header = Валюта

date-header = Дата

comment-header = Комментарий

all-transactions-header = Все транзакции

incomes-list-header = Приходы

outcomes-list-header = Расходы

hash-header = Хеш

check-header = Check

## Компоновщики

balance = Баланс

main-zero-balance = В настоящее время нулевой.

## Обработчики

main-menu = Вы в главном меню!

input-users-below = Выберите пользователя из списка ниже.

input-currency = Выберите валюту:

picked-currency = Выбрано: { $currency }

write-all-amount-data = Введите сумму в формате:
                        {"\u000A"}[сумма]

input-crypto = Введите ссылку на транзакцию из TRONSCAN/ETHERSCAN/BSCSCAN, например:
                https://tronscan.org/#/transaction/3194a00c5cf427a931b908453588b2ca3f661dafa3860b76a6362d08b3b08583

input-comment = Введите комментарий:

## Ошибки

error = Произошла ошибка при обработке действия {
    $name ->
    [none] ,
    *[other] в сцене "{ $name }",
} пожалуйста, попробуйте снова.

input-error = Вы ввели некорректные

input-error-currency = { input-error } данные валюты.

currency-not-enough-money-error = Недостаточно средств в этой валюте.

input-error-amount = { input-error } сумму.

comment-empty-error = Комментарий не может быть пустым.

input-error-empty = Все поля должны быть заполнены.

input-error-project = Выбранный проект не существует!

not-enough-rights-error = Извините, у вас недостаточно прав для этого действия.

main-balance-error = Ошибка обработки баланса, попробуйте позже.

## Кнопки клавиатуры

open-button = Открыть

project-button = { $name }

open-project-button = { open-button } {
    $type ->
    *[other] проект
}

balance-button = Баланс

main-balance-button = Общий баланс

income-button = Приход

outcome-button = Расход

report-button = Выписка

exit-button = Выход

confirm-button = Подтвердить

cancel-button = Отмена

back-button = Назад

next-button = Далее

yes-button = Да

no-button = Нет

one-day-button = 1 день

three-days-button = 3 дня

seven-days-button = 7 дней

thirty-days-button = 30 дней

week-button = Неделя

month-button = Месяц

custom-period-button = Свой

january-button = Январь

february-button = Февраль

march-button = Март

april-button = Апрель

may-button = Май

june-button = Июнь

july-button = Июль

august-button = Август

september-button = Сентябрь

october-button = Октябрь

november-button = Ноябрь

december-button = Декабрь

day-button = { $day } день

pdf-button = PDF

full-pdf-button = Полный PDF

excel-button = Excel

add-type-filter-button = Фильтр [Тип]

add-user-filter-button = Фильтр [Пользователь]