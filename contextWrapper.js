export const withCtx = (handler) => async (ctx) => {
    try {
        await handler(ctx);
    } catch (e) {
        console.error("Произошла ошибка, при попытке обработать функцию внутри контекста -", handler, e);
    }
};