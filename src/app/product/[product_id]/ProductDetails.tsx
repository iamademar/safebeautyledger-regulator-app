'use client';

import React, { useState, useEffect } from 'react';
import {
  Page,
  Card,
  InlineGrid,
  BlockStack,
  Text,
  Thumbnail,
  Badge,
  SkeletonBodyText,
  Box,
  Divider,
  SkeletonDisplayText,
  DescriptionList,
  Button,
  Icon
} from '@shopify/polaris';
import { QRCodeSVG } from 'qrcode.react';
import { CheckIcon, XIcon } from '@shopify/polaris-icons';

interface ProductDetailsProps {
  productId: string;
}

interface ProductData {
  name: string;
  brand: string;
  category: string;
  description: string;
  images?: { url: string; alt_text: string }[];
  ingredients?: string[];
  usage_instructions?: string;
  size: string;
  weight: string;
  current_status: string;
  created_by?: {
    name: string;
    email: string;
  };
}

export function ProductDetails({ productId }: ProductDetailsProps) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: '', email: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        if (data.user) {
          setUser({ name: data.user.name, email: data.user.email });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
    
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/beauty-products/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        console.log('----------- product data -----------');
        console.log(data);
        console.log('----------- product data -----------');
        setProduct(data.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAccept = async () => {
    setIsUpdating(true);
    try {
      const updatedProductData = {
        ...product,
        approved: true,
        regulator: {
          name: user.name,
          email: user.email,
        },
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/beauty-products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          jsonData: updatedProductData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve product');
      }

      setProduct(updatedProductData as ProductData);
      console.log('Product approved successfully');
    } catch (error) {
      console.error('Error approving product:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    setIsUpdating(true);
    try {
      const updatedProductData = {
        ...product,
        approved: false,
        regulator: {
          name: user.name,
          email: user.email,
        },
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/beauty-products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          jsonData: updatedProductData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject product');
      }

      setProduct(updatedProductData as ProductData);
      console.log('Product rejected successfully');
    } catch (error) {
      console.error('Error rejecting product:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <LoadingLayout />;
  }

  if (!product) {
    return (
      <Page title="Product Not Found">
        <Text variant="bodyLg" as="p">
          The requested product could not be found.
        </Text>
      </Page>
    );
  }

  return (
    <Page
      backAction={{ content: "Products", url: "/products" }}
      title={product.name}
    >
      <InlineGrid columns={{ xs: 1, md: "2fr 1fr" }} gap="400">
        <BlockStack gap="400">
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Product Details</Text>
              <Text variant="bodyMd" as="p">{product.description}</Text>
              <Text variant="headingMd" as="h4">Category</Text>
              <Text variant="bodyMd" as="p">{product.category}</Text>
              <Text variant="headingSm" as="h4">Images</Text>
              <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                {product.images && product.images.length > 0 ? (
                  product.images.map((image, index) => (
                    <Thumbnail
                      key={index}
                      source={image.url}
                      alt={image.alt_text}
                      size="large"
                    />
                  ))
                ) : (
                  <Text variant="bodyMd" as="p">No images available</Text>
                )}
              </InlineGrid>
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Ingredients</Text>
              {product.ingredients && product.ingredients.length > 0 ? (
                <ul>
                  {product.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              ) : (
                <Text variant="bodyMd" as="p">No ingredients listed</Text>
              )}
              <Text variant="headingSm" as="h3">Usage Instructions</Text>
              <Text variant="bodyMd" as="p">{product.usage_instructions || 'No usage instructions available'}</Text>
            </BlockStack>
          </Card>
        </BlockStack>
        <BlockStack gap={{ xs: "400", md: "200" }}>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Quality Control</Text>
              <InlineGrid columns={1} gap="300">
                {product.approved === true ? (
                  <Button
                    icon={CheckIcon}
                    tone="success"
                  >
                    Approved
                  </Button>
                ) : product.approved === false ? (
                  <Button icon={XIcon}
                    tone="critical" 
                  >
                    Rejected
                  </Button>
                ) : (
                  <>
                    <Button icon={CheckIcon} tone="success" onClick={handleAccept} disabled={isUpdating}>
                      {isUpdating ? "Updating Blockchain" : "Accept"}
                    </Button>
                    <Button icon={XIcon} tone="critical" onClick={handleReject} disabled={isUpdating}>
                      {isUpdating ? "Updating Blockchain" : "Decline"}
                    </Button>
                  </>
                )}
              </InlineGrid>
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Product QR Code</Text>
              <QRCodeSVG value={`http://localhost:3000/app/product/${productId}`} size={200} />
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Product Information</Text>
              <DescriptionList
                items={[
                  { term: 'Brand', description: product.brand },
                  { term: 'Size', description: product.size },
                  { term: 'Weight', description: product.weight },
                  { term: 'Status', description: <Badge>{product.current_status}</Badge> },
                ]}
              />
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Created By</Text>
              {product.created_by ? (
                <>
                  <Text variant="bodyMd" as="p">{product.created_by.name}</Text>
                  <Text variant="bodySm" as="p">{product.created_by.email}</Text>
                </>
              ) : (
                <Text variant="bodyMd" as="p">Creator information not available</Text>
              )}
            </BlockStack>
          </Card>
        </BlockStack>
      </InlineGrid>
    </Page>
  );
}

function LoadingLayout() {
  return (
    <Page title="Loading Product">
      <InlineGrid columns={{ xs: 1, md: "2fr 1fr" }} gap="400">
        <BlockStack gap="400">
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <Box minHeight="20rem" />
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={5} />
            </BlockStack>
          </Card>
        </BlockStack>
        <BlockStack gap={{ xs: "400", md: "200" }}>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={3} />
              <Divider />
              <SkeletonBodyText lines={2} />
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={2} />
            </BlockStack>
          </Card>
        </BlockStack>
      </InlineGrid>
    </Page>
  );
}
