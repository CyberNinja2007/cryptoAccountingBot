# This is the english localization file for telegram bot Invista

### For internal use only

## Scene names

start-scene-name = Start

income-scene-name = Creating income

outcome-scene-name = Creating outcome

report-scene-name = Report

## Start scene

telegram-id = Your telegram_id: { $id }

welcome = Welcome to the project!

admin-project-name = Administration

welcome-to-project = You are in the project "{ $name }"

input-action = Choose an action below:

## Transactions

transaction-summary = <b>Creating {
    $type ->
    [in] income
    *[out] outcome
} :</b>{"\u000A"}{"\u000A"}——————————————{"\u000A"}Amount: <b>{ $amountString } { $currency }</b>{"\u000A"}
                { $cryptoTransactionString }Comment: "{ $comment }"

success = Success!

# Report scene

input-period = Choose a period:

input-report-type = Choose a convenient form of representation.

input-report-type-with-filter = Active filters:{"\u000A"}{ $currency }{"\u000A"}{ $user }{"\u000A"}{ $type }{"\u000A"}Choose a convenient form of representation.

input-beginning-date = Choose start date:

input-end-date = Choose end date:

input-day = Choose a day:

input-types = Choose type:

period = {
    $isEqual ->
    [true] for {$startDateText}
    *[other] from {$startDateText} to {$endDateText}
}

report-project-name = {
    $type ->
    *[project] project
} { $name }

report-name-pdf = Report for { report-project-name } { period }.pdf

report-name-xlsx = Report for { report-project-name } { period }.xlsx

id-header = Serial

name-header = Name

type-header = Type

amount-header = Amount

currency-header = Currency

date-header = Date

comment-header = Comment

all-transactions-header = Transactions (All)

incomes-list-header = Incomes

outcomes-list-header = Expences

hash-header = Hash

## Composers

balance = Total balance

user-zero-balance = zero for all currencies

main-zero-balance = Currently zero.

## Handlers

main-menu = You are in the main menu!

input-users-below = Choose a user from the suggestions below.

input-currency = Choose a currency below:

picked-currency = Chosen { $currency }

write-all-amount-data = Enter the amount in format {
    $needMaxBalance ->
    [true] (not more than { $availableBalance }) :
    *[other] :
}{"\u000A"}[amount]

input-crypto = Enter the link to transaction from TRONSCAN/ETHERSCAN/BSCSCAN, for example:
                https://tronscan.org/#/transaction/3194a00c5cf427a931b908453588b2ca3f661dafa3860b76a6362d08b3b08583

input-comment = Enter a comment (more than 10 characters):

## Errors

error = An error occurred while processing the action {
    $name ->
    [none] ,
    *[other] in the scene "{ $name }",
} please try again.

input-error = You entered an incorrect

input-error-currency = { input-error } currency.

currency-not-enough-money-error = There are no available funds in this currency.

input-error-amount = { input-error } amount.

comment-error = The comment must be at least 10 characters long.

comment-empty-error = The comment cannot be empty.

input-error-empty = No fields should be empty.

input-error-project = The chosen project does not exist!

not-enough-rights-error = Sorry, you don't have enough rights for that

main-balance-error = An error occurred while processing the main balance, please try again later.

## Keyboard buttons

open-button = Open

project-button = { $name }

open-project-button = { open-button } {
    $type ->
    *[other] the project
}

balance-button = Total balance

income-button = Income

outcome-button = Expense

report-button = Report

exit-button = Exit

confirm-button = Confirm

cancel-button = Cancel

back-button = Back

in-type-button = Receive

out-type-button = Issue

next-button = Next

yes-button = Yes

no-button = No

one-day-button = 1 day

three-days-button = 3 days

seven-days-button = 7 days

thirty-days-button = 30 days

week-button = Week

month-button = Month

custom-period-button = Custom period

january-button = January

february-button = February

march-button = March

april-button = April

may-button = May

june-button = June

july-button = July

august-button = August

september-button = September

october-button = October

november-button = November

december-button = December

day-button = { $day } day

pdf-button = PDF

excel-button = Excel

add-currency-filter-button = Filter [Currency]

add-person-filter-button = Filter [Person]

add-type-filter-button = Filter [Type]