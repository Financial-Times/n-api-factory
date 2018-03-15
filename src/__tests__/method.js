import nock from 'nock';

import { fetchWithErrorParser } from '../method';

const config = {
	API_HOST: 'http://mock.com',
	API_KEY: 'mock.key',
};

describe('fetchWithErrorParser', () => {
	afterEach(() => {
		nock.cleanAll();
		jest.clearAllMocks();
	});

	it('return the parsed data correctly if response.ok', async () => {
		const res = { foo: 'bar' };
		nock(config.API_HOST)
			.get('/')
			.reply(200, res);
		const data = await fetchWithErrorParser(`${config.API_HOST}`);
		expect(data).toEqual(res);
	});

	it('return undefined if response.status 204', async () => {
		nock(config.API_HOST)
			.get('/')
			.reply(204);

		const data = await fetchWithErrorParser(`${config.API_HOST}`);
		expect(data).toBe(undefined);
	});

	it('return undefined if the response.body is emtpy', async () => {
		nock(config.API_HOST)
			.get('/')
			.reply(200, '', { 'Content-Length': '0' });

		const data = await fetchWithErrorParser(`${config.API_HOST}`);
		expect(data).toBe(undefined);
	});

	it('return formatted error correctly if response is error', async () => {
		nock(config.API_HOST)
			.get('/')
			.reply(404, { message: 'some message' });
		try {
			await fetchWithErrorParser(`${config.API_HOST}`);
			throw new Error('it should throw an exception');
		} catch (e) {
			expect(e).toEqual({
				category: 'FETCH_RESPONSE_ERROR',
				contentType: 'application/json',
				status: 404,
				message: {
					message: 'some message',
				},
			});
		}
	});
});
