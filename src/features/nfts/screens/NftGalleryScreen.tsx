import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TouchableWithoutFeedback, ScrollView, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { Card } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';
import { NftItem } from '../services/NftService';

const { width } = Dimensions.get('window');

interface NftGalleryScreenProps {
  nfts: NftItem[];
  isFetching: boolean;
  onBack: () => void;
  isDarkMode?: boolean;
}

export const NftGalleryScreen: React.FC<NftGalleryScreenProps> = memo(({
  nfts,
  isFetching,
  onBack,
  isDarkMode = true,
}) => {
  const [selectedNft, setSelectedNft] = useState<NftItem | null>(null);

  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  const renderItem = ({ item }: { item: NftItem }) => {
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => setSelectedNft(item)}
        activeOpacity={0.8}
      >
        <Card isDarkMode={isDarkMode} style={styles.nftCard}>
          <Image source={{ uri: item.image }} style={styles.nftThumbnail} />
          <View style={styles.nftInfo}>
            <Text style={[styles.nftName, { color: textColor }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.nftSymbol, { color: subtextColor }]} numberOfLines={1}>
              {item.symbol}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>NFT Gallery</Text>
        <View style={{ width: 60 }} />
      </View>

      {isFetching ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: subtextColor }]}>Loading Gallery...</Text>
        </View>
      ) : nfts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🖼️</Text>
          <Text style={[styles.emptyText, { color: subtextColor }]}>No NFTs discovered in this account</Text>
        </View>
      ) : (
        <FlatList
          data={nfts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Expanded NFT Metadata Glass Modal */}
      {selectedNft && (
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setSelectedNft(null)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalWrapper}>
              <Card isDarkMode={isDarkMode} style={styles.modalCard}>
                <TouchableOpacity
                  style={styles.closeIconBtn}
                  onPress={() => setSelectedNft(null)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <X size={20} color="#ffffff" />
                </TouchableOpacity>
                
                <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <Image source={{ uri: selectedNft.image }} style={styles.modalHeroImage} />
              
              <Text style={[styles.modalName, { color: textColor }]}>{selectedNft.name}</Text>
              <Text style={[styles.modalSymbol, { color: '#3b82f6' }]}>{selectedNft.symbol}</Text>
              
              <Text style={[styles.modalDesc, { color: subtextColor }]}>
                {selectedNft.description}
              </Text>

              {/* Mint Address details */}
              <View style={[styles.addressBox, isDarkMode ? styles.boxDark : styles.boxLight]}>
                <Text style={[styles.addressLabel, { color: subtextColor }]}>Mint Address</Text>
                <Text style={[styles.addressText, { color: textColor }]} numberOfLines={1}>
                  {selectedNft.mintAddress}
                </Text>
              </View>

              {/* Attributes Grid */}
              <Text style={[styles.attrHeader, { color: textColor }]}>Properties</Text>
              <View style={styles.attributesGrid}>
                {selectedNft.attributes.map((attr, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.attrCapsule,
                      isDarkMode ? styles.capsuleDark : styles.capsuleLight,
                    ]}
                  >
                    <Text style={[styles.attrType, { color: subtextColor }]}>
                      {attr.trait_type}
                    </Text>
                    <Text style={[styles.attrValue, { color: textColor }]}>
                      {attr.value}
                    </Text>
                  </View>
                ))}
              </View>

              <Button
                title="Close"
                onPress={() => setSelectedNft(null)}
                isDarkMode={isDarkMode}
                style={styles.closeBtn}
                showIcon={false}
              />
            </ScrollView>
          </Card>
        </View>
      </TouchableWithoutFeedback>
    </TouchableOpacity>
  )}
    </View>
  );
});

NftGalleryScreen.displayName = 'NftGalleryScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  backBtn: {
    paddingVertical: 8,
    width: 60,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  flatListContent: {
    paddingBottom: 40,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  nftCard: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  nftThumbnail: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  nftInfo: {
    padding: 10,
  },
  nftName: {
    fontSize: 12,
    fontWeight: '800',
  },
  nftSymbol: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 7, 20, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  modalWrapper: {
    width: '100%',
    maxHeight: '85%',
  },
  modalCard: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    padding: 20,
  },
  closeIconBtn: {
    position: 'absolute',
    top: 28,
    right: 28,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  modalScroll: {
    width: '100%',
  },
  modalHeroImage: {
    width: '100%',
    height: width - 80,
    borderRadius: 16,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '900',
  },
  modalSymbol: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  modalDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 16,
  },
  addressBox: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  boxDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  boxLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 11,
    fontWeight: '700',
  },
  attrHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  attrCapsule: {
    width: '47%',
    padding: 8,
    borderRadius: 10,
    margin: '1.5%',
    borderWidth: 1,
  },
  capsuleDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  capsuleLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  attrType: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  attrValue: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  closeBtn: {
    width: '100%',
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
});
export default NftGalleryScreen;
