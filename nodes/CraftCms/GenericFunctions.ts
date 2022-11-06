import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-core';

import { IDataObject, IHookFunctions, NodeApiError } from 'n8n-workflow';

export async function craftCmsRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	body: IDataObject = {},
) {
	const credentials = (await this.getCredentials('craftCmsApi')) as {
		endpoint: string;
		personalAccessToken: string;
	};

	const options = {
		headers: {
			Authorization: `Bearer ${credentials.personalAccessToken}`,
		},
		method: 'POST',
		body,
		uri: `${credentials.endpoint}`,
		json: true,
	};

	const responseData = await this.helpers.request!.call(this, options);

	if (responseData.errors) {
		throw new NodeApiError(this.getNode(), responseData);
	}

	return responseData;
}
