CREATE TABLE public.projects (
                                 project_id uuid NOT NULL DEFAULT gen_random_uuid(),
                                 project_name text NOT NULL,
                                 project_type text NOT NULL DEFAULT 'wallet',
                                 CONSTRAINT projects_pk PRIMARY KEY (project_id)
);

CREATE TABLE public.users (
                              user_id uuid NOT NULL DEFAULT gen_random_uuid(),
                              user_name text NOT NULL,
                              user_status text NOT NULL DEFAULT 'active',
                              user_locale text NOT NULL DEFAULT 'ru',
                              CONSTRAINT users_pk PRIMARY KEY (user_id)
);

CREATE TABLE public.permissions (
                                    permission_id uuid NOT NULL DEFAULT gen_random_uuid(),
                                    "permission" text NOT NULL,
                                    permission_meaning text NOT NULL,
                                    CONSTRAINT permissions_pk PRIMARY KEY (permission_id)
);

CREATE TABLE public.user_permissions (
                                         fk_user_id uuid NOT NULL,
                                         fk_project_id uuid NOT NULL,
                                         fk_permission_id uuid NOT NULL,
                                         allowed bool NOT NULL DEFAULT false,
                                         CONSTRAINT user_permissions_pk PRIMARY KEY (fk_user_id,fk_project_id,fk_permission_id),
                                         CONSTRAINT user_permissions_fk FOREIGN KEY (fk_user_id) REFERENCES public.users(user_id),
                                         CONSTRAINT user_permissions_fk_1 FOREIGN KEY (fk_project_id) REFERENCES public.projects(project_id),
                                         CONSTRAINT user_permissions_fk_2 FOREIGN KEY (fk_permission_id) REFERENCES public.permissions(permission_id)
);

CREATE TABLE public.accounts (
                                 account_id uuid NOT NULL DEFAULT gen_random_uuid(),
                                 fk_user_id uuid NOT NULL,
                                 telegram_id bigint NOT NULL,
                                 CONSTRAINT accounts_pk PRIMARY KEY (account_id),
                                 CONSTRAINT accounts_fk FOREIGN KEY (fk_user_id) REFERENCES public.users(user_id)
);

CREATE TABLE public.currencies (
                                   currency_id uuid NOT NULL DEFAULT gen_random_uuid(),
                                   currency_name text NOT NULL,
                                   CONSTRAINT currencies_pk PRIMARY KEY (currency_id)
);

CREATE TABLE public.project_currencies (
                                           fk_project_id uuid NOT NULL,
                                           fk_currency_id uuid NOT NULL,
                                           CONSTRAINT project_currencies_pk PRIMARY KEY (fk_project_id,fk_currency_id),
                                           CONSTRAINT project_currencies_fk FOREIGN KEY (fk_project_id) REFERENCES public.projects(project_id),
                                           CONSTRAINT project_currencies_fk_1 FOREIGN KEY (fk_currency_id) REFERENCES public.currencies(currency_id)
);

CREATE TABLE public.transactions (
                                     transaction_id bigserial NOT NULL,
                                     fk_user_id uuid NOT NULL,
                                     fk_account_id uuid NOT NULL,
                                     "type" text NOT NULL,
                                     fk_currency_id uuid NOT NULL,
                                     amount numeric(19, 9) NOT NULL,
                                     "comment" text NOT NULL DEFAULT '',
                                     created timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
                                     fk_project_id uuid NOT NULL,
                                     hash text NULL,
                                     crypto_type text NULL,
                                     CONSTRAINT transactions_pk PRIMARY KEY (transaction_id),
                                     CONSTRAINT transactions_fk FOREIGN KEY (fk_user_id) REFERENCES public.users(user_id),
                                     CONSTRAINT transactions_fk_1 FOREIGN KEY (fk_account_id) REFERENCES public.accounts(account_id),
                                     CONSTRAINT transactions_fk_2 FOREIGN KEY (fk_currency_id) REFERENCES public.currencies(currency_id),
                                     CONSTRAINT transactions_fk_3 FOREIGN KEY (fk_project_id) REFERENCES public.projects(project_id)
);

CREATE TABLE public.logs (
                             event_id uuid NOT NULL DEFAULT gen_random_uuid(),
                             event_type text NULL,
                             created timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
                             object_id text NOT NULL,
                             object_data jsonb NOT NULL,
                             object_type text NOT NULL,
                             CONSTRAINT logs_pk PRIMARY KEY (event_id)
);

CREATE TABLE public.crypto_transactions (
                                     crypto_transaction_id uuid NOT NULL DEFAULT gen_random_uuid(),
                                     hash text NULL,
                                     amount numeric(19, 9) NOT NULL,
                                     token text NOT NULL,
                                     created timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
                                     CONSTRAINT crypto_transactions_pk PRIMARY KEY (crypto_transaction_id)
);
