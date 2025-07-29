import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalization } from '../../application/i18n/LocalizationProvider';
import { Button } from '../components/ui/core/Button/Button';
import { Card } from '../components/ui/data-display/Card/Card';
import { Badge } from '../components/ui/core/Badge/Badge';
import { Alert } from '../components/ui/feedback/Alert/Alert';

export const LocalizationTestPage: React.FC = () => {
  const { t } = useTranslation();
  const { language, isRTL, changeLanguage } = useLocalization();

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'ar' : 'en');
  };

  const tableData = [
    {
      name: t('testContent.tableData.john'),
      email: 'john@example.com',
      role: t('testContent.tableData.admin'),
      status: t('testContent.tableData.active')
    },
    {
      name: t('testContent.tableData.jane'),
      email: 'jane@example.com',
      role: t('testContent.tableData.user'),
      status: t('testContent.tableData.inactive')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Language Info */}
      <div className="max-w-6xl mx-auto mb-8">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="default" className="text-sm">
                {t('currentLanguage')}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {t('currentDirection')}
              </Badge>
              <Badge variant={isRTL ? 'warning' : 'success'} className="text-sm">
                {t('language')}: {t('direction')}
              </Badge>
            </div>
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="md"
              className="min-w-[140px]"
            >
              {t('switchLanguage')}
            </Button>
          </div>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('welcome')}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {t('description')}
          </p>
          <Alert variant="info" className="mb-4">
            <div>
              <strong>Direction Test:</strong> This content automatically switches between LTR and RTL based on the selected language.
            </div>
          </Alert>
        </Card>

        {/* Typography Test */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {t('testContent.heading')}
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {t('testContent.paragraph')}
          </p>
          
          {/* Buttons Test */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary" size="md">
              {t('testContent.button')}
            </Button>
            <Button variant="secondary" size="md">
              Secondary Action
            </Button>
            <Button variant="outline" size="md">
              Outline Button
            </Button>
          </div>

          {/* Input Test */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Input Field
            </label>
            <input
              type="text"
              placeholder={t('testContent.inputPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Badge Test */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="default">Primary Badge</Badge>
            <Badge variant="secondary">Secondary Badge</Badge>
            <Badge variant="success">Success Badge</Badge>
            <Badge variant="warning">Warning Badge</Badge>
            <Badge variant="destructive">Error Badge</Badge>
          </div>
        </Card>

        {/* Table Test */}
        <Card className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Data Table Test
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                    {t('testContent.tableHeaders.name')}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                    {t('testContent.tableHeaders.email')}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                    {t('testContent.tableHeaders.role')}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                    {t('testContent.tableHeaders.status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{row.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.email}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.role}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Badge 
                        variant={row.status === t('testContent.tableData.active') ? 'success' : 'secondary'}
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Navigation Menu Test */}
        <Card className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Navigation Menu Test
          </h3>
          <nav className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
            <a href="#" className="px-4 py-2 rounded-md bg-white shadow-sm text-gray-900 font-medium">
              Home
            </a>
            <a href="#" className="px-4 py-2 rounded-md text-gray-600 hover:bg-white hover:shadow-sm">
              Products
            </a>
            <a href="#" className="px-4 py-2 rounded-md text-gray-600 hover:bg-white hover:shadow-sm">
              Services
            </a>
            <a href="#" className="px-4 py-2 rounded-md text-gray-600 hover:bg-white hover:shadow-sm">
              About
            </a>
            <a href="#" className="px-4 py-2 rounded-md text-gray-600 hover:bg-white hover:shadow-sm">
              Contact
            </a>
          </nav>
        </Card>

        {/* Layout Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-3">Card 1</h4>
            <p className="text-gray-600 mb-4">
              This card tests how content flows in different directions.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Action
            </Button>
          </Card>
          
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-3">Card 2</h4>
            <p className="text-gray-600 mb-4">
              Notice how buttons, text alignment, and spacing adapt automatically.
            </p>
            <Button variant="primary" size="sm" className="w-full">
              Primary Action
            </Button>
          </Card>
          
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-3">Card 3</h4>
            <p className="text-gray-600 mb-4">
              The layout maintains visual consistency across both directions.
            </p>
            <Button variant="secondary" size="sm" className="w-full">
              Secondary Action
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};