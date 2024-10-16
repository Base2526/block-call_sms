import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Checkbox, Switch, Card, Select, Row, Col, Typography  } from 'antd';
import moment from "moment";
import { useQuery, useMutation } from "@apollo/client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import _ from "lodash"
import { faker } from '@faker-js/faker';
import { useSelector } from 'react-redux';

import { getHeaders, getCookie } from "@/utils"
import { queryMembers, faker_agent, 
        faker_insurance, mutationTest_addmember, 
        query_users, mutation_report, mutation_register,
        guery_provinces, query_banks } from "@/apollo/gqlQuery"

import  { DefaultRootState } from '@/interface/DefaultRootState';
// import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
// import SaleOrderPDF from './PDF';

import handlerError from '@/utils/handlerError';

interface SaleItem {
    id: number;
    name: string;
    amount: number;
    checked: boolean;
}

interface UserType {
    _id: string;
}

const { mode, REACT_APP_HOST_GRAPHAL }  = process.env

const Faker: React.FC = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const { profile } = useSelector((state : DefaultRootState) => state.user);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [provinces, setProvinces] = useState<any[]>([]);
    const [banks, setBanks] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    // console.log("profile ", profile)

    const { loading: loadingProvinces, 
        data: dataProvinces, 
        error: errorProvinces } = useQuery(guery_provinces, {
        context: { headers: getHeaders(location) },
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: false,
    });

    if (errorProvinces) {
        handlerError(props, errorProvinces);
    }
    useEffect(() => {
    if (!loadingProvinces && dataProvinces?.provinces) {
        setProvinces([]);
        if (dataProvinces?.provinces.status) {
            _.map(dataProvinces?.provinces.data, (e) => {
                setProvinces((prevItems) => Array.isArray(prevItems) ? [...prevItems, e] : [e]);
            });
        }
    }
    }, [dataProvinces, loadingProvinces]);

    const { loading: loadingBanks, 
        data: dataBanks, 
        error: errorBanks} = useQuery(query_banks, {
        context: { headers: getHeaders(location) },
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: false,
        });
    
    if (errorBanks) {
        handlerError(props, errorBanks);
    }

    useEffect(() => {
        if (!loadingBanks && dataBanks?.banks) {
            setBanks([]);
            if (dataBanks?.banks.status) {
                setBanks(dataBanks?.banks.data);
            }
        }
    }, [dataBanks, loadingBanks]);

    const { loading: loadingUsers, 
        data: dataUsers, 
        error: errorUsers  } =  useQuery(  query_users, {
                                            context: { headers: getHeaders(location) },
                                            fetchPolicy: 'cache-first', 
                                            nextFetchPolicy: 'network-only', 
                                            notifyOnNetworkStatusChange: false,
                                        });
    if(errorUsers){
        handlerError(props, errorUsers)
    }
    useEffect(() => {
        if(!loadingUsers){
            if(!_.isEmpty(dataUsers?.users)){
                console.log("dataMembers?.members :", dataUsers?.users)
                if(dataUsers.users.status){
                    setUsers(dataUsers.users.data)
                }
            }
        }
    }, [dataUsers, loadingUsers])

    const [onRegister] = useMutation(mutation_register, {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {register}}) => { 
            console.log("register :", register)
        },
        onCompleted( data ) {
        //   history.goBack()
        },
        onError(error){
          console.log("register onError :", error)
        }
    });

    const [onFakerAgent, resultFakerAgent] = useMutation(faker_agent, {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {faker_agent}}) => { 
            console.log("faker_agent ", faker_agent)
        },
        onCompleted( data ) {
        //   history.goBack()
        },
        onError(error){
          console.log("faker_agent onError :", error)
        }
    });

    const [onFakerInsurance, resultFakerInsurance] = useMutation(faker_insurance, {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {faker_insurance}}) => { 
            console.log("faker_insurance ", faker_insurance)
        },
        onCompleted( data ) {
        //   history.goBack()
        },
        onError(error){
          console.log("faker_insurance onError :", error)
        }
    });

    
    const [onReport] = useMutation(mutation_report, {
        context: { headers: getHeaders(location) },
        update: (cache, { data: { report } }) => {
          console.log("report:", report);
        },
        onCompleted: (data) => {
        },
        onError: (error) => {
        }
    });

    // const [onMlm, resultMlm] = useMutation(mutationMlm, { 
    //     context: { headers: getHeaders(location) },
    //     onCompleted: async(datas)=>{
    //         console.log("onCompleted :", datas)
    //         // let {status, data, sessionId} = datas.login
    //         // if(status){
    //         //     // localStorage.setItem('usida', sessionId)
    //         //     setCookie('usida', sessionId)
    //         //     updateProfile(data)
    //         // }

    //         // onMlm({ variables: { input: { parentId: selectedOption }} })

    //         // navigate("/")
    //     },
    //     onError(err){
    //         console.log("onError :", err)
    //     }
    // });

    // const { loading: loadingMembers, 
    //     data: dataMembers, 
    //     error: errorMembers  } =  useQuery(   queryMembers, {
    //                                         context: { headers: getHeaders(location) },
    //                                         fetchPolicy: 'cache-first', 
    //                                         nextFetchPolicy: 'network-only', 
    //                                         notifyOnNetworkStatusChange: false,
    //                                     });

    // useEffect(() => {
    //     if(!loadingMembers){
    //         if(!_.isEmpty(dataMembers?.members)){
    //             setUsers([])
    //             if(dataMembers.members.status){
                    
    //                 _.map(dataMembers.members.data, (e, key)=>{
                        
    //                     // const newItem: any = {key, displayName: e.current.displayName, email: e.current.email, avatar: e.current.avatar?.url,  roles: e.current.roles, timestamp:e.updatedAt}; 
    //                     // console.log("e :", e, newItem)
    //                     setUsers((prevItems) => {
    //                         if (Array.isArray(prevItems)) { // Check if prevItems is an array
    //                             return [...prevItems, e];
    //                         } else {
    //                             console.error('prevItems is not an array:', prevItems);
    //                             return [e]; // Fallback to ensure it is always an array
    //                         }
    //                     });
    //                 })
    //             }
    //         }
    //     }
    // }, [dataMembers, loadingMembers])

    useEffect(()=>{
        // console.log("users :", users)
    }, [users])

    const onFinishUser = (values: any) => {
        console.log('onFinishUser Received values:', values);
        // Here you can handle form submission (e.g., send data to an API)

        for ( var i = 0; i < 1000; i++ ) {
            let name = faker.name.firstName().toLowerCase()

            let newInput =  {
                password: name,
                username: name,
                email: faker.internet.email(),
            }
            onRegister({ variables: { input: newInput } });
        }
    };

    const onFinishAgent = (values: any) => {
        console.log('onFinishAgent Received values:', values);
        // Here you can handle form submission (e.g., send data to an API)

        const prefixs = ['mr', 'ms', 'mrs']
        const status  = ['active', 'inactive', 'pending']
        const agentTypes = ['agent', 'broker', 'distributor']
        const saleStatus = ['completed', 'pending', 'canceled']
        
        for ( var i = 0; i < 100; i++ ) {
            let newInput = {
                            code: faker.datatype.uuid(),
                            prefix: prefixs[Math.floor(Math.random() * prefixs.length)],
                            address: faker.address.streetAddress(),
                            province: faker.address.state(),
                            district: faker.address.state(),
                            firstName: faker.name.firstName(),
                            lastName: faker.name.lastName(),
                            subDistrict: faker.name.lastName(),
                            postalCode: faker.address.zipCode(),
                            status: status[Math.floor(Math.random() * status.length)],
                            agentType: agentTypes[Math.floor(Math.random() * agentTypes.length)],
                            mobile: faker.phone.phoneNumber(),
                            licenseNumber: faker.datatype.uuid(),
                            idCardNumber: faker.datatype.uuid(),
                            phone: faker.phone.phoneNumber(),
                            collateralAmount: faker.datatype.number({ min: 1000, max: 100000 }),
                            creditLimit: faker.datatype.number({ min: 1000, max: 100000 }),
                            email: faker.internet.email(),
                            multipleAmount: faker.datatype.number({ min: 1, max: 10 }),
                            availableCredit: faker.datatype.number({ min: 0, max: 100000 }),
                            lineupAgent: faker.name.findName(),
                            seiBrokerCode: faker.datatype.uuid(),
                            sjaBrokerCode: faker.datatype.uuid(),
                            salesAmount: faker.datatype.number({ min: 0, max: 1000 }),
                            paymentAmount: faker.datatype.number({ min: 0, max: 1000 }),
                            remainingCredit: faker.datatype.number({ min: 0, max: 1000 }),
                            oldCode: faker.datatype.uuid(),
                            remarks: faker.lorem.sentence(),
                            salesStatus: saleStatus[Math.floor(Math.random() * saleStatus.length)],
                        }

            console.log("newInput :", newInput)
            onFakerAgent({ variables: { input: newInput } });
        }
    };

    const onFinishInsurance = (values: any) => {
        console.log('onFinishInsurance Received values:', values);
        // Here you can handle form submission (e.g., send data to an API)

        const types = ['normal', 'juristic']
        const evidences  = ['id card', 'passport']
        const titles = ['mr', 'mrs', 'miss']
        const genders = ['-', 'male', 'female']

        for ( var i = 0; i < 100; i++ ) {
            let newInput = {
                policyNumber: faker.datatype.uuid(),
                type: types[Math.floor(Math.random() * types.length)],
                evidence: evidences[Math.floor(Math.random() * evidences.length)],
                number: faker.datatype.number().toString(),
                houseNumber: faker.datatype.number().toString(),
                group: faker.datatype.number().toString(),
                title: titles[Math.floor(Math.random() * titles.length)],
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                village: faker.address.streetName(),
                alley: faker.address.streetName(),
                soi: faker.address.streetName(),
                province: faker.address.state(),
                district: faker.address.city(),
                subDistrict: faker.address.city(),
                postalCode: faker.address.zipCode(),
                mobile: faker.phone.phoneNumber(),
                phone: faker.phone.phoneNumber(),
                occupation: faker.name.jobTitle(),
                businessAddress: faker.address.streetAddress(),
                branch: faker.address.city(),
                birthDate: faker.date.past(30),
                gender: genders[Math.floor(Math.random() * genders.length)],
                nationality: 'Thai',
                companyManager: faker.name.findName(),
                idNumber: faker.datatype.number().toString(),
                dob: faker.date.past(30),
                registeredAddress: faker.address.streetAddress(),
                currentAddress: faker.address.streetAddress(),
                vehicleCode: faker.datatype.uuid(),
                coverageStartDate: faker.date.future(),
                coverageEndDate: faker.date.future(),
                contractDate: faker.date.recent(),
                vehicleName: faker.vehicle.vehicle(),
                vehicleModel: faker.vehicle.model(),
                vehicleYear: faker.date.past(20).getFullYear(),
                vehicleColor: faker.vehicle.color(),
                plateType: faker.name.firstName(),
                vehicleType: 'normal',
                vehicleCountry: 'thai',
                chassisNumber: faker.datatype.uuid(),
                registrationNumber1: faker.datatype.uuid(),
                registrationNumber2: faker.datatype.uuid(),
                registrationProvince: faker.address.state(),
                cc: faker.datatype.number({ min: 100, max: 5000 }),
                seats: faker.datatype.number({ min: 2, max: 8 }),
                weight: faker.datatype.number({ min: 500, max: 3000 }),
                days: 365,
                expenses: parseFloat(faker.finance.amount(0, 10000, 2)),
            }

            console.log("newInput :", newInput)
            onFakerInsurance({ variables: { input: newInput } });
        }
    };

    // Function to generate a random color in HEX format
    const getRandomColor = (): string => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return `#${randomColor.padStart(6, '0')}`; // Ensure it's a 6-digit hex
    };

    // Function to generate a random size
    const getRandomSize = (): number => {
        return Math.floor(Math.random() * 100) + 20; // Size between 20 and 120
    };

    // Function to generate a random file name
    const generateRandomFileName = () => {
        const timestamp = Date.now(); // Use the current timestamp
        return `image-${timestamp}.png`; // Create a unique filename
    };

    const createPngFile = async (): Promise<File | null> => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            // Clear the canvas
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
            // Generate random properties
            const color = getRandomColor();
    
            // Randomly choose to draw a rectangle or circle
            const drawShape = Math.random() < 0.5; // 50% chance to draw a rectangle or circle
    
            ctx.fillStyle = color;
    
            if (drawShape) {
              // Draw rectangle that fills the entire canvas
              ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            } else {
              // Draw circle that fills the entire canvas
              const radius = Math.min(canvasRef.current.width, canvasRef.current.height) / 2;
              ctx.beginPath();
              ctx.arc(canvasRef.current.width / 2, canvasRef.current.height / 2, radius, 0, Math.PI * 2);
              ctx.fill();
            }
    
            // Convert canvas to a PNG file
            return new Promise((resolve) => {
                canvasRef.current && canvasRef.current.toBlob((blob) => {
                if (blob) {
                  const fileName = generateRandomFileName(); // Get a random file name
                  const file = new File([blob], fileName, { type: 'image/png' });
                  console.log('File created:', file);
                  resolve(file); // Resolve the promise with the file
                } else {
                  resolve(null); // Resolve with null if blob creation failed
                }
              }, 'image/png');
            });
          }
        }
        return null; // Return null if canvas is not available
    };

    // Function to generate an array of PNG files
    const createMultiplePngFiles = async (fileCount: number): Promise<File[]> => {
        const files: File[] = [];

        for (let i = 0; i < fileCount; i++) {
            const file = await createPngFile();
            if (file) {
                files.push(file); // Add the generated file to the array
            }
        }

        return files; // Return the array of files
    };

    const generateIDCard = (): string => {
        // Example custom format for ID: 1234-567890-12-3 (adjust to your format)
        const idPart1 = faker.random.numeric(4); // First part
        const idPart2 = faker.random.numeric(6); // Second part
        const idPart3 = faker.random.numeric(2); // Third part
        const idPart4 = faker.random.numeric(1); // Fourth part (check digit)
    
        return `${idPart1}-${idPart2}-${idPart3}-${idPart4}`;
    };

    const generateTelNumbers = (count: number): any[] => {
        const tels: any[] = [];
        for (let i = 0; i < count; i++) {
            tels.push({tel: faker.phone.phoneNumber()}); // Use 'phoneNumber' method
        }
        return tels;
    };

    const generateSellerAccounts = (count: number): any[] => {
        const sellerAccounts: any[] = [];
        for (let i = 0; i < count; i++) {
            sellerAccounts.push({ sellerAccount: generateIDCard(), bankId: banks[Math.floor(Math.random() * banks.length)]?._id }); 
        }
        return sellerAccounts;
    };

    const generateIdCardNumber = (): string => {
        const idCard = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
        return idCard; // Returns a 13-digit string
      };

    const onFinishReport=  async(values: any) => {
        for ( var i = 0; i < 500; i++ ) {

            const fileCount = Math.floor(Math.random() * 8) + 1; // Define the number of files you want to generate
            const images = await createMultiplePngFiles(fileCount); // Call the function to create multiple files

            let newInput = {
                ownerId: users[Math.floor(Math.random() * users.length)]._id,
                sellerFirstName: faker.name.firstName(),
                sellerLastName: faker.name.firstName(),
                idCard: generateIdCardNumber(),
                product: faker.name.jobTitle(),
                transferAmount: faker.commerce.price(),
                transferDate: new Date(),
                sellingWebsite: faker.address.streetAddress(),
                provinceId: provinces[Math.floor(Math.random() * provinces.length)]._id,
                telNumbers: generateTelNumbers(fileCount),
                sellerAccounts: generateSellerAccounts(fileCount), //[{ sellerAccount: 'A001', bankId: ObjectId('66fa659dec7a4f0134b57610') }],
                additionalInfo: faker.name.jobTitle(),
                images,
            }

            let input = { mode:'added', ...newInput }
            console.log("onReport newInput :", input)

            onReport({ variables: { input  } });
        }
    }

    const sampleData = [
        { code: 'A001', description: 'Item 1', quantity: 2, unit: 'pcs', unitPrice: 10.0 },
        { code: 'A002', description: 'Item 2', quantity: 5, unit: 'pcs', unitPrice: 15.0 },
        // Add more items as needed
    ];
    

    const saleItems: SaleItem[] = [
        { id: 1, name: 'Product A', amount: 50, checked: true },
        { id: 2, name: 'Product B', amount: 30, checked: false },
        { id: 3, name: 'Product C', amount: 20, checked: true },
        // Add more items as needed
      ];

    return (
        <div>
            <canvas ref={canvasRef} width={200} height={200} style={{ display: 'none' }} />
    
            <Card title="Create User" style={{ marginBottom: '10px' }}>
                <Form layout="vertical" onFinish={onFinishUser}>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Create
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <Card title="Create Agent" style={{ marginBottom: '10px' }}>
                <Form layout="vertical" onFinish={onFinishAgent}>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Create
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <Card title="Create Insurance" style={{ marginBottom: '10px' }}>
                <Form layout="vertical" onFinish={onFinishInsurance}>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Create
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Create Report" style={{ marginBottom: '10px' }}>
                <Form layout="vertical" onFinish={onFinishReport}>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Create
                        </Button>
                    </Form.Item>
                </Form>
            </Card>


            <div style={{ padding: 20 }}>
    <h1>Download Sale Order PDF</h1>
    {/* <PDFViewer width="100%" height="600">
        <SaleOrderPDF  />
      </PDFViewer> */}
      {/* <PDFDownloadLink document={<SaleOrderPDF data={sampleData} />} fileName="full-screen-table.pdf">
        {({ loading }) => (loading ? 'Loading document...' : 'Download PDF')}
      </PDFDownloadLink> */}

{/* <PDFDownloadLink document={<SaleOrderPDF items={saleItems} />} fileName="sale-report.pdf">
      {({ loading }) => (loading ? 'Loading document...' : 'Download Sale Report')}
    </PDFDownloadLink> */}

{/* <SaleOrderPDF content={content} /> */}
  </div>
        </div>
    );
};

export default Faker;