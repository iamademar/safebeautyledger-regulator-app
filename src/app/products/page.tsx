'use client';

import React, { useState, useEffect } from 'react';
import {
  Page,
  DataTable,
  LegacyCard,
  Text,
  Badge,
  Loading,
  Button
} from '@shopify/polaris';
import Link from 'next/link';

interface Product {
  product_id: string;
  data: {
    name: string;
    brand: string;
    category: string;
    current_status: string;
    images: { url: string; alt_text: string }[];
  };
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/beauty-products`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.products)) {
          console.log(data.products);
          setProducts(data.products);
        } else {
          throw new Error('Invalid data structure');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const rows = products
    .filter(product => product.data.current_status === "In QA")
    .slice()
    .reverse()
    .map(({ product_id, data }) => [
      <React.Fragment key={`${product_id}-id`}>{product_id}</React.Fragment>,
      <Text key={`${product_id}-name`} variant="bodyMd" fontWeight="bold" as="span">
        {data.name}
      </Text>,
      <React.Fragment key={`${product_id}-brand`}>{data.brand}</React.Fragment>,
      <React.Fragment key={`${product_id}-category`}>{data.category}</React.Fragment>,
      <Badge key={`${product_id}-approved`} progress={getApprovalStatus(data.approved)}>
        {getApprovalText(data.approved)}
      </Badge>,
      <Link key={`${product_id}-link`} href={`/product/${product_id}`} passHref>
        <Button size="slim">View</Button>
      </Link>
    ]);

  return (
    <Page title="Products">
      <LegacyCard>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loading />
          </div>
        ) : (
          <DataTable
            columnContentTypes={[
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
            ]}
            headings={[
              'Product ID',
              'Name',
              'Brand',
              'Category',
              'Approved',
              'Action',
            ]}
            rows={rows}
          />
        )}
      </LegacyCard>
    </Page>
  );
}

function getApprovalStatus(approved: boolean | null): 'warning' | 'success' | 'critical' | undefined {
  if (approved === undefined) return 'warning';
  return approved ? 'success' : 'critical';
}

function getApprovalText(approved: boolean | null): string {
  if (approved === undefined) return 'Pending QA';
  return approved ? 'Accepted' : 'Rejected';
}
