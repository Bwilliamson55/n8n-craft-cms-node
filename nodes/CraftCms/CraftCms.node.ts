import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { craftCmsRequest } from './GenericFunctions';

export class CraftCms implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
		displayName: 'CraftCms',
		name: 'craftCms',
		icon: 'file:craftCms.svg',
		group: ['transform'],
		version: 1,
		description: 'Consume CraftCms API',
		defaults: {
			name: 'CraftCms',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'craftCmsApi',
				required: true,
			},
		],

		properties: [
			// Resources and operations will go here
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Entry',
						value: 'entry',
					},
				],
				default: 'entry',
				noDataExpression: true,
				required: true,
				description: 'Create a new entry',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'entry',
						],
					},
				},
				options: [
					{
						name: 'Get Entry',
						value: 'getEntry',
						description: 'Get an entry',
						action: 'Get an entry',
					},
					{
						name: 'Get Entries',
						value: 'getEntries',
						description: 'Get Entries with filters',
						action: 'Get entries',
					},
				],
				default: 'getEntry',
				noDataExpression: true,
			},
			{
				displayName: 'Entry Id',
				name: 'entryId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'getEntry',
						],
						resource: [
							'entry',
						],
					},
				},
				default:'',
				placeholder: '0',
				description:'Get Entry by Id',
			},
			{
				displayName: 'Search Filter',
				name: 'searchFilter',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'getEntries',
						],
						resource: [
							'entry',
						],
					},
				},
				default:'',
				placeholder: 'Search string for the entries here',
				description:'Filter by Search string on entries',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'entry',
						],
						operation: [
							'getEntries',
							'getEntry'
						],
					},
				},
				options: [
					{
						displayName: 'Return Field Handle',
						name: 'fieldHandle',
						type: 'string',
						default: 'status',
					},
				],
			},
		],
	};

	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Handle data coming from previous nodes
		const items = this.getInputData();
		let responseData;
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// For each item, make an API call to getEntry an entry
		for (let i = 0; i < items.length; i++) {
				if (resource === 'entry') {
					if (operation === 'getEntry') {
						// Get Id input
						const entryId = parseInt(this.getNodeParameter('entryId', i) as string, 10);
						// Get additional fields input
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						let returnFields = '';
						for (const key of Object.keys(additionalFields)) {
							returnFields += Object.entries(additionalFields).map((field: any) => field.fieldHandle).join(',');
						};
						// Make graphql request
						responseData = await craftCmsRequest.call(this, {
							query: `
									query GetEntryById($id: INT) {
										entry(id: $id) {
											id,
											$returnFields
										}
								}`,
							operationName: 'GetEntryById',
							variables: {
								id: entryId,
								returnFields: returnFields,
							},
						});
						returnData.push(responseData);
					}
					if (operation === 'getEntries') {
						// Get Search input
						const searchFilter = this.getNodeParameter('searchFilter', i) as string
						// Get additional fields input
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						let returnFields = ''
						for (const key of Object.keys(additionalFields)) {
							returnFields += Object.entries(additionalFields).map((field: any) => field.fieldHandle).join()
						}
						// Make graphql request
						responseData = await craftCmsRequest.call(this, {
							query: `
									query GetEntriesSearch($search: String) {
										entries(search: $search) {
											id,
											$returnFields
										}
								}`,
							operationName: 'GetEntriesSearch',
							variables: {
								search: searchFilter,
								returnFields,
							},
						});
						returnData.push(responseData);
					}
				}
		}
		// Map data to n8n data structure
		return [this.helpers.returnJsonArray(returnData)];
	}
}
