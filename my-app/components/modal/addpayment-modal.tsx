"use client";
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Button} from '@/components/ui/button';
import { Modal } from "@/components/ui/modal"
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  onSave: (cardDetails: { cardNumber: string; expiryDate: string; cvv: string }) => void;
}

export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  onSave,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSave = () => {
    onSave({ cardNumber, expiryDate, cvv });
    onClose();
  };

  if (!isMounted) return null;

  return (
    <Modal
      title="Add New Payment Method"
      description="Add a new payment method to your account."
      isOpen={isOpen}
      onClose={onClose}
    >    
    <div className="pt-6 space-x-2 flex items-center justify-end w-full">
      <div className="">
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Add New Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <Input
            placeholder="Expiry Date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
          <Input
            placeholder="CVV"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </CardFooter>
      </Card>
      </div>
    </div>
    </Modal>
  );
};

export default AddPaymentMethodModal;