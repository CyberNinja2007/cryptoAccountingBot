export const filter = (commandKey, handler) => {
    return async (ctx, next) => {
        const localizedCommand = ctx.t(commandKey);
        if (ctx.message && ctx.message.text === localizedCommand) {
            return handler(ctx);
        }
        return next();
    };
};