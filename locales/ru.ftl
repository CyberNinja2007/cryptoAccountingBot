# Файл локализации на русском языке для Telegram бота Invista

### Только для внутреннего использования

## Названия сцен

start-scene-name = Старт

income-scene-name = Создание дохода

outcome-scene-name = Создание расхода

report-scene-name = Отчёт

## Сцена старта

telegram-id = Ваш telegram_id: { $id }

welcome = Добро пожаловать в проект!

admin-project-name = Администрирование

welcome-to-project = Вы в проекте "{ $name }"

input-action = Выберите действие ниже:

## Транзакции

transaction-summary = <b>Создание {
    $type ->
    [in] дохода
    *[out] расхода
} :</b>{"\u000A"}{"\u000A"}——————————————{"\u000A"}Сумма: <b>{ $amountString } { $currency }</b>{"\u000A"}
                { $cryptoTransactionString }Комментарий: "{ $comment }"

success = Успешно!

# Сцена отчёта

input-period = Выберите период:

input-report-type = Выберите удобную форму представления.

input-report-type-with-filter = Активные фильтры:{"\u000A"}{ $currency }{"\u000A"}{ $user }{"\u000A"}{ $type }{"\u000A"}Выберите удобную форму представления.

input-beginning-date = Выберите дату начала:

input-end-date = Выберите дату окончания:

input-day = Выберите день:

input-types = Выберите тип:

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

incomes-list-header = Доходы

outcomes-list-header = Расходы

hash-header = Хеш

## Компоновщики

balance = Общий баланс

user-zero-balance = нулевой по всем валютам

main-zero-balance = В настоящее время нулевой.

## Обработчики

main-menu = Вы в главном меню!

input-users-below = Выберите пользователя из списка ниже.

input-currency = Выберите валюту:

picked-currency = Выбрано: { $currency }

write-all-amount-data = Введите сумму в формате {
    $needMaxBalance ->
    [true] (не более { $availableBalance }) :
    *[other] :
}{"\u000A"}[сумма]

input-crypto = Введите ссылку на транзакцию из TRONSCAN/ETHERSCAN/BSCSCAN, например:
                https://tronscan.org/#/transaction/3194a00c5cf427a931b908453588b2ca3f661dafa3860b76a6362d08b3b08583

input-comment = Введите комментарий (не менее 10 символов):

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

comment-error = Комментарий должен содержать не менее 10 символов.

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

balance-button = Общий баланс

income-button = Доход

outcome-button = Расход

report-button = Отчёт

exit-button = Выход

confirm-button = Подтвердить

cancel-button = Отмена

back-button = Назад

in-type-button = Приход

out-type-button = Расход

next-button = Далее

yes-button = Да

no-button = Нет

one-day-button = 1 день

three-days-button = 3 дня

seven-days-button = 7 дней

thirty-days-button = 30 дней

week-button = Неделя

month-button = Месяц

custom-period-button = Произвольный период

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

excel-button = Excel

add-currency-filter-button = Фильтр [Валюта]

add-person-filter-button = Фильтр [Пользователь]

add-type-filter-button = Фильтр [Тип]