import {Composer} from 'telegraf';
import {handleError} from '../handlers.js';
import {getAccount} from '../db/controllers/accountController.js';

const composer = new Composer();

composer.command("start", async (ctx) => {
    try {
        const userAccount = await getAccount(ctx.chat.id);

        if (!userAccount) {
            return;
        }

        return ctx.scene.enter("startScene");
    } catch (e) {
        await handleError(ctx, e);
    }
});

export default composer;