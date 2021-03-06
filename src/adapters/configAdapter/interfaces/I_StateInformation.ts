import { pipe } from 'fp-ts/lib/pipeable';
import * as D from 'io-ts/Decoder';

export interface StateInformation {
	stateID: string;
	stateName: string;
	functions?: string;
	rooms?: string;
	store2DB: boolean;
}

export const stateInformation = pipe(
	D.type({
		stateID: D.string,
		stateName: D.string,
		store2DB: D.boolean,
	}),
	D.intersect(
		D.partial({
			functions: D.string,
			rooms: D.string,
		}),
	),
);

export const stateInformations = D.array(stateInformation);
