import { generateStore, EventActions } from 'drizzle';
import drizzleOptions from '../drizzleOptions';

const contractEventNotifier = store => next => action => {
    if (action.type === EventActions.EVENT_FIRED) {
        // const contract = action.name;
        const contractEvent = action.event.event;
        const message = action.event.returnValues._message
        console.log(`[${contractEvent}] ${message}`);
    }
    return next(action);
}

const appMiddlewares = [contractEventNotifier];

export default generateStore({
    drizzleOptions,
    appMiddlewares
});
