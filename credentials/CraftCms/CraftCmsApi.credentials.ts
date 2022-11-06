import {
	IAuthenticateGeneric,
  ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CraftCmsApi implements ICredentialType {
	name = 'craftCmsApi';
	displayName = 'Craft Cms API';
	properties: INodeProperties[] = [
		{
			displayName: 'Endpoint',
			name: 'endpoint',
			type: 'string',
			default: '',
			placeholder: 'https://your-craft.com/graphql',
		},
		{
			displayName: 'Personal Access Token',
			name: 'personalAccessToken',
			type: 'string',
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
      headers: {
				Authorization: '=Bearer {{$credentials.personalAccessToken}}',
			},
		},
	};

  test: ICredentialTestRequest = {
    request: {
			method: 'POST',
			body: '{entries{id}}',
			url: '={{$credentials?.endpoint}}',
			json: true,
    },
  };
}
