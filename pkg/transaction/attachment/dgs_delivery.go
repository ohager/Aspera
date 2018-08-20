package attachment

import (
	"bytes"
	"encoding/binary"
	"io"

	"gopkg.in/restruct.v1"
)

type DgsDeliveryAttachment struct {
	Purchase    uint64
	GoodsLength uint32
	GoodsData   []byte
	GoodsNonce  []byte
	DiscountNQT uint64
}

func DgsDeliveryAttachmentFromBytes(bs []byte) (Attachment, int, error) {
	var attachment DgsDeliveryAttachment
	if len(bs) < 16 {
		return nil, 0, io.ErrUnexpectedEOF
	}

	encryptedGoodsLenth := binary.LittleEndian.Uint16(bs[8:10])

	r := bytes.NewReader(bs)

	if err := binary.Read(r, binary.LittleEndian, &attachment.Purchase); err != nil {
		return nil, 0, err
	}

	if err := binary.Read(r, binary.LittleEndian, &attachment.GoodsLength); err != nil {
		return nil, 0, err
	}

	goodsData := make([]byte, encryptedGoodsLenth)
	if err := binary.Read(r, binary.LittleEndian, &goodsData); err != nil {
		return nil, 0, err
	}
	attachment.GoodsData = goodsData

	goodsNonce := make([]byte, 32)
	if err := binary.Read(r, binary.LittleEndian, &goodsNonce); err != nil {
		return nil, 0, err
	}
	attachment.GoodsNonce = goodsNonce

	if err := binary.Read(r, binary.LittleEndian, &attachment.DiscountNQT); err != nil {
		return nil, 0, err
	}

	return &attachment, int(r.Size()) - r.Len(), nil
}

func (attachment *DgsDeliveryAttachment) ToBytes() ([]byte, error) {
	return restruct.Pack(binary.LittleEndian, attachment)
}
