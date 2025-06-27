'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  X,
  Share2,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Check,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Info,
  Bell,
  Download,
  QrCode,
  Globe,
  Smartphone,
  Camera,
  Settings,
  Star,
  Heart,
  Users,
  Calendar,
  MapPin,
  Target,
  DollarSign,
  Shield,
  Zap,
  Award,
  MessageCircle,
  Play,
  Image as ImageIcon
} from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal = ({ isOpen, onClose, children, title, size = 'md' }: ModalProps) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-background rounded-lg ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  url: string;
  image?: string;
}

export const ShareModal = ({ isOpen, onClose, title, description, url, image }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url)}`,
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Campaign" size="md">
      <div className="p-6 space-y-6">
        {image && (
          <div className="aspect-video rounded-lg overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
        )}

        <div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Share via</label>
          <div className="grid grid-cols-2 gap-3">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center space-x-2 p-3 text-white rounded-lg transition-colors ${link.color}`}
              >
                <link.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{link.name}</span>
              </a>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Or copy link</label>
          <div className="flex space-x-2">
            <Input value={url} readOnly className="flex-1" />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className={copied ? 'bg-green-50 border-green-200' : ''}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {copied && (
            <p className="text-sm text-green-600 mt-1">Link copied to clipboard!</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: ConfirmationModalProps) => {
  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertTriangle className="h-12 w-12 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      default:
        return <Info className="h-12 w-12 text-blue-500" />;
    }
  };

  const getConfirmVariant = () => {
    switch (variant) {
      case 'destructive':
        return 'destructive';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 text-center space-y-4">
        <div className="flex justify-center">{getIcon()}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
          <Button variant={getConfirmVariant() as any} onClick={onConfirm} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: string) => void;
}

export const WalletModal = ({ isOpen, onClose, onConnect }: WalletModalProps) => {
  const wallets = [
    {
      name: 'MetaMask',
      description: 'Connect using browser wallet',
      icon: '🦊',
      type: 'metamask',
      available: typeof window !== 'undefined' && (window as any).ethereum
    },
    {
      name: 'WalletConnect',
      description: 'Scan with WalletConnect to connect',
      icon: '🔗',
      type: 'walletconnect',
      available: true
    },
    {
      name: 'Coinbase Wallet',
      description: 'Connect using Coinbase Wallet',
      icon: '🔵',
      type: 'coinbase',
      available: true
    },
    {
      name: 'Rainbow',
      description: 'Connect using Rainbow wallet',
      icon: '🌈',
      type: 'rainbow',
      available: true
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Wallet" size="md">
      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground mb-6">
          Choose your preferred wallet to connect to the platform
        </p>
        
        {wallets.map((wallet) => (
          <button
            key={wallet.type}
            onClick={() => wallet.available && onConnect(wallet.type)}
            disabled={!wallet.available}
            className={`w-full p-4 border rounded-lg text-left transition-colors ${
              wallet.available
                ? 'hover:bg-muted border-border'
                : 'opacity-50 cursor-not-allowed border-muted'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{wallet.icon}</div>
              <div className="flex-1">
                <div className="font-medium">{wallet.name}</div>
                <div className="text-sm text-muted-foreground">{wallet.description}</div>
              </div>
              {!wallet.available && (
                <Badge variant="outline" className="text-xs">
                  Not Available
                </Badge>
              )}
            </div>
          </button>
        ))}

        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Secure Connection</h4>
              <p className="text-xs text-muted-foreground mt-1">
                We never store your private keys. Your wallet remains secure at all times.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
  }>;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationModal = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationModalProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications" size="md">
      <div className="max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.read ? 'bg-background' : 'bg-blue-50 dark:bg-blue-950/20'
                  }`}
                  onClick={() => !notification.read && onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.timestamp.toLocaleDateString()} at{' '}
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  title?: string;
}

export const ImageViewerModal = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onPrevious,
  onNext,
  title
}: ImageViewerModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="relative">
        {title && (
          <div className="p-4 border-b">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} of {images.length}
            </p>
          </div>
        )}
        
        <div className="relative aspect-video bg-black">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={onPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                disabled={currentIndex === 0}
              >
                ←
              </button>
              <button
                onClick={onNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                disabled={currentIndex === images.length - 1}
              >
                →
              </button>
            </>
          )}
        </div>
        
        {images.length > 1 && (
          <div className="p-4 border-t">
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {/* Set current index */}}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                    index === currentIndex ? 'border-charity-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: string;
  title: string;
  description?: string;
}

export const QRCodeModal = ({ isOpen, onClose, data, title, description }: QRCodeModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6 text-center space-y-4">
        <div className="bg-white p-4 rounded-lg inline-block">
          {/* QR Code would be generated here */}
          <div className="w-48 h-48 bg-muted flex items-center justify-center">
            <QrCode className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-xs font-mono break-all">{data}</p>
        </div>
        
        <Button
          onClick={() => navigator.clipboard.writeText(data)}
          variant="outline"
          className="w-full"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy to Clipboard
        </Button>
      </div>
    </Modal>
  );
};

export default Modal; 