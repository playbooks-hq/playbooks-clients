import { projectExistingMessageContext } from 'src/services/conversation-context';
export const getMessage = async (options: any) => {
	return (await projectExistingMessageContext(options)).message;
};
