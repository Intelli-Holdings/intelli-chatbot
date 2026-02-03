"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Eye, EyeOff, MoreVertical, Trash2, Star, Plus, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PaymentCard {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  holderName: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
}

interface CardWalletProps {
  cards: PaymentCard[];
  onSetDefault: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onViewDetails: (cardId: string) => void;
}

const CardWallet: React.FC<CardWalletProps> = ({
  cards,
  onSetDefault,
  onDeleteCard,
  onViewDetails,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [revealedCard, setRevealedCard] = useState<string | null>(null);
  const [revealedDetails, setRevealedDetails] = useState<string | null>(null);

  const getBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'from-blue-600 to-teal-800';
      case 'mastercard':
        return 'from-blue-600 to-blue-800';
      case 'amex':
        return 'from-emerald-600 to-emerald-800';
      case 'discover':
        return 'from-orange-600 to-orange-800';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const toggleReveal = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedCard(revealedCard === cardId ? null : cardId);
  };

  const toggleRevealDetails = (cardId: string) => {
    setRevealedDetails(revealedDetails === cardId ? null : cardId);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Wallet Container */}
      <motion.div
        className="relative w-80 h-48 cursor-pointer mx-auto"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
      >
        {/* Wallet Body */}
        <motion.div
          className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: `
              linear-gradient(135deg, #8B4513 0%, #A0522D 25%, #8B4513 50%, #654321 75%, #8B4513 100%),
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)
            `,
            backgroundBlendMode: "overlay",
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.2)
            `,
          }}
          animate={{
            rotateX: isOpen ? -15 : 0,
            rotateY: isOpen ? 5 : 0,
          }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Leather Texture Overlay */}
          <div
            className="absolute inset-0 rounded-2xl opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                radial-gradient(circle at 75% 75%, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "8px 8px, 12px 12px",
            }}
          />

          {/* Stitching Border */}
          <div
            className="absolute inset-2 rounded-xl border-2 border-dashed border-amber-200/30"
            style={{
              borderStyle: "dashed",
              borderWidth: "1px",
              borderSpacing: "4px",
            }}
          />

          {!isOpen && cards.length > 0 && (
            <div className="absolute top-4 right-4 flex flex-col-reverse gap-1">
              {cards.slice(0, 3).map((card, index) => (
                <motion.div
                  key={card.id}
                  className="w-16 h-10 rounded-md shadow-md cursor-pointer relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${getBrandColor(card.brand).split(" ")[1]}, ${getBrandColor(card.brand).split(" ")[3]})`,
                    zIndex: index + 1,
                    marginTop: index > 0 ? "-6px" : "0",
                  }}
                  whileHover={{
                    scale: 1.05,
                    x: -4,
                    transition: { duration: 0.2 },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCard(card.id);
                    setIsOpen(true);
                  }}
                >
                  {/* Card edge highlight */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />

                  {/* Default card indicator */}
                  {card.isDefault && (
                    <div className="absolute top-1 left-1">
                      <Star className="w-2 h-2 text-yellow-300 fill-current" />
                    </div>
                  )}

                  {/* Minimal card indicator */}
                  <div className="absolute bottom-1 left-1">
                    <div className="w-1 h-1 bg-white/60 rounded-full" />
                  </div>
                </motion.div>
              ))}

              {/* Card count indicator if more than 3 cards */}
              {cards.length > 3 && (
                <div className="w-16 h-10 rounded-md bg-amber-200/20 border border-amber-200/40 flex items-center justify-center text-xs text-amber-100 font-medium">
                  +{cards.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Embossed Logo */}
          <div className="absolute top-4 left-4">
            <motion.div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-inner"
              whileHover={{ scale: 1.1 }}
            >
              <CreditCard className="w-4 h-4 text-amber-900" />
            </motion.div>
          </div>

          {/* Wallet Info */}
          <div className="absolute bottom-4 left-4 text-amber-100">
            <p className="text-xs font-medium opacity-80">Intelli Business Wallet</p>
            <p className="text-lg font-bold tracking-wider">{cards.length} Cards</p>
          </div>

          {/* Open Indicator */}
          <motion.div
            className="absolute bottom-4 right-4 text-amber-200"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Plus className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Cards Container - Full View */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-0 left-0 w-80 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                className="absolute w-full h-48 cursor-pointer"
                initial={{
                  y: 0,
                  rotateX: 0,
                  scale: 1,
                  zIndex: cards.length - index,
                }}
                animate={{
                  y: selectedCard === card.id ? -120 : -60 - index * 20,
                  rotateX: selectedCard === card.id ? 0 : -10 - index * 5,
                  scale: selectedCard === card.id ? 1.05 : 0.95 - index * 0.02,
                  zIndex: selectedCard === card.id ? 100 : cards.length - index,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.23, 1, 0.32, 1],
                }}
                whileHover={{
                  scale: selectedCard === card.id ? 1.05 : 1,
                  y: selectedCard === card.id ? -120 : -70 - index * 20,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCard(selectedCard === card.id ? null : card.id);
                }}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                }}
              >
                {/* Card */}
                <div
                  className={`w-full h-full rounded-2xl bg-gradient-to-br ${getBrandColor(card.brand)} shadow-xl relative`}
                  style={{
                    boxShadow:
                      selectedCard === card.id
                        ? `0 30px 60px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                        : `0 20px 40px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                  }}
                >
                  {/* Card Shine Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent ${
                      selectedCard === card.id ? 'shine-animation' : ''
                    }`}
                    style={{
                      transform: selectedCard === card.id ? "translateX(100%)" : "translateX(-100%)",
                    }}
                  />

                  <motion.div
                    className="absolute inset-4 flex flex-col justify-between text-white"
                    animate={{
                      opacity: selectedCard === card.id ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-start">
                      <motion.div
                        className="flex items-center gap-2"
                        animate={{
                          scale: selectedCard === card.id ? 1.1 : 1,
                        }}
                      >
                        <span className="text-sm font-medium opacity-90">
                          {revealedDetails === card.id ? card.holderName : card.holderName.replace(/./g, '•')}
                        </span>
                        {card.isDefault && (
                          <Badge className="bg-yellow-500 text-yellow-900 text-xs px-1 py-0">
                            <Star className="h-2 w-2 mr-1" />
                            Default
                          </Badge>
                        )}
                      </motion.div>
                      
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-white hover:bg-white/30 rounded-full transition-colors duration-200 border border-white/20 backdrop-blur-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md min-w-[180px]"
                          sideOffset={5}
                        >
                          {!card.isDefault && (
                            <>
                              <DropdownMenuItem onClick={() => onSetDefault(card.id)} className="text-gray-700 hover:bg-gray-100">
                                <Star className="mr-2 h-4 w-4" />
                                Set as Default
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem 
                            onClick={() => toggleRevealDetails(card.id)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            {revealedDetails === card.id ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Hide Card Details
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Reveal Card Details
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onViewDetails(card.id)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {!card.isDefault && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onDeleteCard(card.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Card
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <motion.div
                      animate={{
                        y: selectedCard === card.id ? 0 : 10,
                        opacity: selectedCard === card.id ? 1 : 0.7,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div 
                        className="text-lg font-mono tracking-wider mb-2 cursor-pointer flex items-center gap-2"
                        onClick={(e) => toggleReveal(card.id, e)}
                      >
                        <span>
                          {revealedCard === card.id || revealedDetails === card.id
                            ? `4532 1234 5678 ${card.last4}`
                            : `•••• •••• •••• ${card.last4}`
                          }
                        </span>
                        {revealedCard === card.id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-xs opacity-75 uppercase tracking-wide">{card.brand}</div>

                      <AnimatePresence>
                        {selectedCard === card.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="mt-2 pt-2 border-t border-white/20"
                          >
                            <div className="flex justify-between text-xs">
                              <span className="opacity-75">
                                EXP: {revealedDetails === card.id 
                                  ? `${String(card.expMonth).padStart(2, '0')}/${card.expYear.toString().slice(-2)}`
                                  : '••/••'
                                }
                              </span>
                              <span className="opacity-75">
                                CVV: {revealedDetails === card.id ? '123' : '•••'}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close Button */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute -top-12 right-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, delay: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setSelectedCard(null);
              }}
              className="text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardWallet;
