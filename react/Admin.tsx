import type { FC } from 'react'
import React, { useState, useEffect } from 'react'
import {
  Layout,
  PageHeader,
  PageBlock,
  Button,
  Input,
  Spinner,
  Toggle,
  ToastConsumer,
  ToastProvider,
  Tab,
  Tabs,
  Table,
  IconPlusLines,
  Modal,
  ButtonWithIcon,
  Alert
} from 'vtex.styleguide'
import { useIntl, FormattedMessage } from 'react-intl'
import { useQuery, useLazyQuery, useMutation } from 'react-apollo'
import { Link } from 'vtex.render-runtime'

import M_INIT_CONFIG from './mutations/InitConfiguration.gql'
import RemoveConfiguration from './mutations/RemoveConfiguration.gql'
import ConnectionTest from './queries/connectionTest.graphql'
import AppSettings from './queries/appSettings.graphql'
import SaveAppSettings from './mutations/saveAppSettings.graphql'

import GET_CUSTOMERS from './queries/ListCustomers.gql'
import DELETE_CUSTOMER from './mutations/DeleteCustomer.gql'
import CREATE_CUSTOMER from './mutations/CreateCustomer.gql'

const Admin: FC<any> = () => {
  const { formatMessage } = useIntl()
  const [settingsState, setSettingsState] = useState({
    apiToken: '',
    isLive: false,
    enableTaxCalculation: false,
    enableTransactionPosting: false,
    useTaxJarNexus: true,
    salesChannelExclude: '',
    currentTab: 1,
    updateTableKey: '',
    isModalOpen: false,
    customerName: '',
    customerEmail: '',
    customerExemptionType: '',
    customerState: '',
    customerCountry: '',
    customerList: undefined,
    customerCreationError: false
  })

  const [testAllowed, setTestAllowed] = useState(false)
  const [testComplete, setTestComplete] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const plus = <IconPlusLines />

  const { data } = useQuery(AppSettings, {
    variables: {
      version: process.env.VTEX_APP_VERSION,
    },
    ssr: false,
  })

  const [
    testConnection,
    {
      loading: connectionTestLoading,
      data: connectionTestData,
      refetch: connectionTestRefetch,
    },
  ] = useLazyQuery(ConnectionTest, {
    onError: () => setTestComplete(true),
    onCompleted: () => setTestComplete(true),
  })

  const [getCustomers, {data: customerData, called: customerCalled}] = useLazyQuery(GET_CUSTOMERS)
  const [saveSettings] = useMutation(SaveAppSettings)
  const [initConfig] = useMutation(M_INIT_CONFIG)
  const [removeConfig] = useMutation(RemoveConfiguration)
  const [createCustomer] = useMutation(CREATE_CUSTOMER)
  const [deleteCustomer] = useMutation(DELETE_CUSTOMER)

  useEffect(() => {
    if (!data?.appSettings?.message) return

    const parsedSettings = JSON.parse(data.appSettings.message)

    if (parsedSettings.apiToken) setTestAllowed(true)
    setSettingsState(parsedSettings)
  }, [data])

  const handleSaveSettings = async (showToast: any) => {
    setSettingsLoading(true)

    try {
      if (settingsState.enableTaxCalculation) {
        await initConfig()
      } else {
        await removeConfig()
      }

      await saveSettings({
        variables: {
          version: process.env.VTEX_APP_VERSION,
          settings: JSON.stringify(settingsState),
        },
      }).then(() => {
        showToast({
          message: formatMessage({
            id: 'admin/taxjar.saveSettings.success',
          }),
          duration: 5000,
        })
        setTestAllowed(true)
        setTestComplete(false)
        setSettingsLoading(false)
      })
    } catch (error) {
      console.error(error)
      showToast({
        message: formatMessage({
          id: 'admin/taxjar.saveSettings.failure',
        }),
        duration: 5000,
      })
      setTestAllowed(false)
      setTestComplete(false)
      setSettingsLoading(false)
    }
  }

  const handleTestConnection = () => {
    if (connectionTestData) {
      connectionTestRefetch()

      return
    }

    testConnection()
  }

  if (!customerCalled) {
    getCustomers()
  }

  if (customerCalled && settingsState.customerList === undefined && customerData?.listCustomers){
    const newList = customerData?.listCustomers || []
    setSettingsState({...settingsState, customerList: newList})
  }

  if (!settingsState.currentTab) {
    setSettingsState({
      ...settingsState,
      currentTab: 1
    })
  }

  const handleModalToggle = () => {
    setSettingsState({ ...settingsState, isModalOpen: !settingsState.isModalOpen })
  }

  const handleCustomerCreate = async () => {
    const customer: object = {
      name: settingsState.customerName,
      customerId: settingsState.customerEmail,
      exemptionType: settingsState.customerExemptionType,
      exemptRegions: [{
        state: settingsState.customerState,
        country: settingsState.customerCountry
      }]
    }

    let res: any 
    try {
      res = await createCustomer({
        variables: {
          customer
        },
      })
    } finally {
      if (res?.data.createCustomer) {
        const random = Math.random().toString(36).substring(7)
        const newCustomerList: any = settingsState.customerList || []
        newCustomerList.push(customer)
        setSettingsState({ ...settingsState, customerList: newCustomerList, updateTableKey: random, isModalOpen: false })
      } else {
        setSettingsState({ ...settingsState, customerCreationError: true, isModalOpen: false })
      }
    }
  }

  const handleCustomerDelete = (rowData: any) => {
    const random = Math.random().toString(36).substring(7)
    const customerList = settingsState.customerList || []
    const newCustomerList: any = customerList?.filter((customer: any) => customer.customerId !== rowData.customerId)
    setSettingsState({...settingsState, customerList: newCustomerList, updateTableKey: random})
  }

  const lineActions = [
    {
      label: () => <FormattedMessage id="admin/taxjar.settings.exemption.line-action.label" />,
      isDangerous: true,
      onClick: async ({ rowData }: any) => {
        deleteCustomer({
          variables: {
            customerId: rowData.customerId
          },
        }),
        handleCustomerDelete(rowData)
        alert(formatMessage({
          id: 'admin/taxjar.settings.exemption.line-action.alert',
        }))
      }
    },
  ]

  const customerSchema = {
    properties: {
      name: {
        title: 'Name',
        width: 175,
      },
      id: {
        title: 'Email',
        width: 250,
        cellRenderer: (cellData: any) => {
          return (
            <div>
              {cellData.rowData.customerId}
            </div>
          )
        },
      },
      exemptionType: {
        title: 'Exemption Type',
        width: 150,
      },
      regions: {
        title: 'Exempt Regions',
        width: 150,
        cellRenderer: (cellData: any) => {
          const regions = cellData.rowData.exemptRegions
          return (
            <div>
              {regions.map((region: any) => {
                return (
                  <div key={region.state}>{region['state']}{`, `}{region['country']}</div>
                )
              })}
            </div>
          )
        },
      },
    },
  }

  if (!data) {
    return (
      <Layout
        pageHeader={
          <PageHeader title={<FormattedMessage id="admin/taxjar.title" />} />
        }
        fullWidth
      >
        <PageBlock>
          <Spinner />
        </PageBlock>
      </Layout>
    )
  }

  return (
    <ToastProvider positioning="window">
      <ToastConsumer>
        {({ showToast }: { showToast: any }) => (
          <Layout
            pageHeader={
              <PageHeader
                title={<FormattedMessage id="admin/taxjar.title" />}
              />
            }
            fullWidth
          >
              <PageBlock
                subtitle={
                  <FormattedMessage
                    id="admin/taxjar.settings.introduction"
                    values={{
                      tokenLink: (
                        // eslint-disable-next-line react/jsx-no-target-blank
                        <Link
                          to="https://support.taxjar.com/article/160-how-do-i-get-a-taxjar-sales-tax-api-token"
                          target="_blank"
                        >
                          https://support.taxjar.com/ar[...]-api-token
                        </Link>
                      ),
                      signupLink: (
                        // eslint-disable-next-line react/jsx-no-target-blank
                        <Link
                          to="https://partners.taxjar.com/English"
                          target="_blank"
                        >
                          https://partners.taxjar.com/English
                        </Link>
                      ),
                      lineBreak: <br />,
                    }}
                  />
                }
              >
              
              <Tabs>
                <Tab
                  label="Settings"
                  active={settingsState.currentTab === 1}
                  onClick={() => setSettingsState({ ...settingsState, currentTab: 1 })}
                >
                  <section className="pb4 mt4">
                    <Input
                      label={formatMessage({
                        id: 'admin/taxjar.settings.apiToken.label',
                      })}
                      value={settingsState.apiToken}
                      onChange={(e: React.FormEvent<HTMLInputElement>) =>
                        setSettingsState({
                          ...settingsState,
                          apiToken: e.currentTarget.value,
                        })
                      }
                      helpText={formatMessage({
                        id: 'admin/taxjar.settings.apiToken.helpText',
                      })}
                      token
                    />
                  </section>
                  <section className="pv4">
                    <Toggle
                      semantic
                      label={formatMessage({
                        id: 'admin/taxjar.settings.isLive.label',
                      })}
                      size="large"
                      checked={settingsState.isLive}
                      onChange={() => {
                        setSettingsState({
                          ...settingsState,
                          isLive: !settingsState.isLive,
                        })
                      }}
                      helpText={formatMessage({
                        id: 'admin/taxjar.settings.isLive.helpText',
                      })}
                    />
                  </section>
                  <section className="pv4">
                    <Toggle
                      semantic
                      label={formatMessage({
                        id: 'admin/taxjar.settings.enableTaxCalculation.label',
                      })}
                      size="large"
                      checked={settingsState.enableTaxCalculation}
                      onChange={() => {
                        setSettingsState({
                          ...settingsState,
                          enableTaxCalculation: !settingsState.enableTaxCalculation,
                        })
                      }}
                      helpText={formatMessage({
                        id: 'admin/taxjar.settings.enableTaxCalculation.helpText',
                      })}
                    />
                  </section>
                  <section className="pv4">
                    <Toggle
                      semantic
                      label={formatMessage({
                        id: 'admin/taxjar.settings.enableTransactionPosting.label',
                      })}
                      size="large"
                      checked={settingsState.enableTransactionPosting}
                      onChange={() => {
                        setSettingsState({
                          ...settingsState,
                          enableTransactionPosting: !settingsState.enableTransactionPosting,
                        })
                      }}
                      helpText={formatMessage({
                        id:
                          'admin/taxjar.settings.enableTransactionPosting.helpText',
                      })}
                    />
                  </section>
                  <section className="pv4">
                    <Toggle
                      semantic
                      label={formatMessage({
                        id: 'admin/taxjar.settings.useTaxJarNexus.label',
                      })}
                      size="large"
                      checked={settingsState.useTaxJarNexus}
                      onChange={() => {
                        setSettingsState({
                          ...settingsState,
                          useTaxJarNexus: !settingsState.useTaxJarNexus,
                        })
                      }}
                      helpText={formatMessage({
                        id:
                          'admin/taxjar.settings.useTaxJarNexus.helpText',
                      })}
                    />
                    </section>
                    <section className="pb4">
                      <Input
                        label={formatMessage({
                        id: 'admin/taxjar.settings.salesChannelExclude.label',
                        })}
                          value={settingsState.salesChannelExclude}
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                          setSettingsState({
                            ...settingsState,
                              salesChannelExclude: e.currentTarget.value,
                              })
                            }
                          helpText={formatMessage({
                              id: 'admin/taxjar.settings.salesChannelExclude.helpText',
                      })}
                    />
                  </section>
                  <section className="pt4">
                    <Button
                      variation="primary"
                      onClick={() => handleSaveSettings(showToast)}
                      isLoading={settingsLoading}
                      disabled={!settingsState.apiToken}
                    >
                      <FormattedMessage id="admin/taxjar.saveSettings.buttonText" />
                    </Button>
                  </section>
                  <section className="pt4">
                    <Button
                      variation="secondary"
                      onClick={() => handleTestConnection()}
                      isLoading={connectionTestLoading}
                      disabled={!testAllowed}
                    >
                      <FormattedMessage id="admin/taxjar.testConnection.buttonText" />
                    </Button>
                    {` `}
                    {testComplete ? (
                      connectionTestData?.findProductCode?.length ? (
                        <FormattedMessage id="admin/taxjar.testConnection.success" />
                      ) : (
                        <FormattedMessage id="admin/taxjar.testConnection.failure" />
                      )
                    ) : null}
                  </section>
                </ Tab>
                <Tab
                  label={formatMessage({
                    id: 'admin/taxjar.settings.exemption.title',
                  })}
                  active={settingsState.currentTab === 2}
                  onClick={() => setSettingsState({ ...settingsState, currentTab: 2 })}
                >
                  <div className="mt8">
                    <ButtonWithIcon
                      onClick={() => handleModalToggle()}
                      icon={plus}
                      variation="secondary"
                    >
                      <FormattedMessage id="admin/taxjar.settings.exemption-modal.label" />
                    </ButtonWithIcon>

                    {settingsState.customerCreationError && (
                      <div className="mt6">
                        <Alert type="error" onClose={() => setSettingsState({ ...settingsState, customerCreationError: false })}>
                          <FormattedMessage id="admin/taxjar.settings.exemption.customer.error" />
                        </Alert>
                      </ div>
                    )}

                    <Modal
                      isOpen={settingsState.isModalOpen}
                      centered
                      title={formatMessage({
                        id: 'admin/taxjar.settings.exemption-modal.label',
                      })}
                      onClose={() => {
                        handleModalToggle()
                      }}
                    >

                      <div className="mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/taxjar.settings.exemption-modal.name',
                          })}
                          type="string"
                          onChange={(e: any) =>
                            setSettingsState({ ...settingsState, customerName: e.target.value })
                          }
                        />
                      </div>

                      <div className="mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/taxjar.settings.exemption-modal.email',
                          })}
                          type="string"
                          onChange={(e: any) =>
                            setSettingsState({ ...settingsState, customerEmail: e.target.value })
                          }
                        />
                      </div>

                      <div className="mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/taxjar.settings.exemption-modal.type',
                          })}
                          type="string"
                          onChange={(e: any) =>
                            setSettingsState({ ...settingsState, customerExemptionType: e.target.value })
                          }
                        />
                      </div>

                      <div className="mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/taxjar.settings.exemption-modal.state',
                          })}
                          type="string"
                          maxLength="2"
                          onChange={(e: any) =>
                            setSettingsState({ ...settingsState, customerState: e.target.value })
                          }
                        />
                      </div>

                      <div className="mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/taxjar.settings.exemption-modal.country',
                          })}
                          type="string"
                          maxLength="2"
                          onChange={(e: any) =>
                            setSettingsState({ ...settingsState, customerCountry: e.target.value })
                          }
                        />
                      </div>

                      <div className="mt6">
                        <Button
                          onClick={() => {
                            handleCustomerCreate()
                            handleModalToggle()
                          }}
                        >
                          <FormattedMessage id="admin/taxjar.settings.exemption-modal.submit" />
                        </Button>
                      </div>

                    </Modal>
                  </div>
                  <div className="mt5">
                    <Table
                      fullWidth
                      updateTableKey={settingsState.updateTableKey}
                      items={settingsState.customerList}
                      density="low"
                      schema={customerSchema}
                      lineActions={lineActions}
                    />
                  </div>
                </ Tab>
              </ Tabs>
            </PageBlock>
          </Layout>
        )}
      </ToastConsumer>
    </ToastProvider>
  )
}

export default Admin
