import { LoginCommand } from 'src/commands/auth/login';
import { LogoutCommand } from 'src/commands/auth/logout';
import { OauthCommand } from 'src/commands/auth/oauth';

export const AuthCommand = async (action, options: any) => {
	if (action === 'logout') return await LogoutCommand(options);
	if (action === 'oauth') return await OauthCommand(options);
	return await LoginCommand(options);
};

export * from 'src/commands/auth/login';
export * from 'src/commands/auth/logout';
export * from 'src/commands/auth/oauth';
