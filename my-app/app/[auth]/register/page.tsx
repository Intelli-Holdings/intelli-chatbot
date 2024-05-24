import React from 'react';
import Signup from "@/components/component/signup";
import { useRouter } from 'next/router';
import { Navbar } from '@/components/navbar';


export default function Register () {
    return (
        <div>
            <Navbar />
            <Signup />
        </div>
    );
};