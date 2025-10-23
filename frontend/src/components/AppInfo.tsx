import React from 'react';
import { config } from '../config/env';
import { APP_CONSTANTS } from '../config/constants';

/**
 * Component to display application information using environment variables
 */
const AppInfo: React.FC = () => {
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Application Information</h3>

      <div>
        <strong>App Name:</strong> {APP_CONSTANTS.APP_NAME}
      </div>

      <div>
        <strong>Version:</strong> {APP_CONSTANTS.APP_VERSION}
      </div>

      <div>
        <strong>Environment:</strong> {APP_CONSTANTS.ENVIRONMENT}
      </div>

      <div>
        <strong>API URL:</strong> {APP_CONSTANTS.API_BASE_URL}
      </div>

      <div>
        <strong>Debug Mode:</strong>{' '}
        {APP_CONSTANTS.DEBUG_MODE ? 'Enabled' : 'Disabled'}
      </div>

      <div>
        <strong>Features:</strong>
        <ul>
          <li>
            Analytics:{' '}
            {APP_CONSTANTS.FEATURES.ANALYTICS ? 'Enabled' : 'Disabled'}
          </li>
          <li>
            Terminal Management:{' '}
            {APP_CONSTANTS.FEATURES.TERMINAL_MANAGEMENT
              ? 'Enabled'
              : 'Disabled'}
          </li>
          <li>
            Payouts: {APP_CONSTANTS.FEATURES.PAYOUTS ? 'Enabled' : 'Disabled'}
          </li>
        </ul>
      </div>

      {config.isDevelopment() && (
        <div style={{ color: 'orange', fontWeight: 'bold' }}>
          🚧 Development Mode Active
        </div>
      )}

      {config.isProduction() && (
        <div style={{ color: 'green', fontWeight: 'bold' }}>
          ✅ Production Mode Active
        </div>
      )}
    </div>
  );
};

export default AppInfo;
